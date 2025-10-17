const zookeeper = require("node-zookeeper-client");

/**
 * ============================================
 * DistributedLock
 * ============================================
 * 
 * A simple distributed locking mechanism built on top of ZooKeeper.
 * 
 * Each client creates an *ephemeral sequential* node under the given lock path.
 * The client whose node has the lowest sequence number holds the lock.
 * 
 * Other clients watch the node that comes immediately before their own node.
 * When that node is deleted (lock released), they try to acquire the lock again.
 */
class DistributedLock
{
    /**
     * Creates a new instance of the DistributedLock class.
     * 
     * @param {object} client - The active ZooKeeper client instance.
     * @param {string} lockPath - The ZooKeeper path where lock nodes are created (e.g. `/locks`).
     */
    constructor(client, lockPath)
    {
        /** @private */
        this.client = client;
        /** @private */
        this.lockPath = lockPath;
        /** @private */
        this.myNodePath = null; // Holds the path of this client's ephemeral sequential node.
    }

    /**
     * Attempts to acquire a distributed lock.
     * 
     * The method:
     * 1. Creates an ephemeral sequential node under the lock path.
     * 2. Checks if it has the smallest sequence number (i.e., first in queue).
     * 3. If not, sets a watch on the node immediately before it.
     * 
     * @returns {Promise<void>} Resolves when the lock is successfully acquired.
     */
    async acquireLock()
    {
        return new Promise((resolve, reject) =>
        {
            this.client.create(
                `${this.lockPath}/lock_`,
                null,
                zookeeper.CreateMode.EPHEMERAL_SEQUENTIAL,
                (err, path) =>
                {
                    if (err) return reject(err);
                    this.myNodePath = path;
                    console.log(`[Lock] Created node: ${path}`);
                    this.tryAcquire(resolve, reject);
                }
            );
        });
    }

    /**
     * Checks if this replica’s node is the lowest in sequence,
     * indicating that it can acquire the lock. Otherwise, it waits
     * for the node immediately before it to be deleted.
     * 
     * @private
     * @param {Function} resolve - Callback to resolve the acquireLock() Promise.
     * @param {Function} reject - Callback to reject the acquireLock() Promise.
     */
    tryAcquire(resolve, reject)
    {
        this.client.getChildren(
            this.lockPath,
            null,
            (err, children) =>
            {
                if (err) return reject(err);

                // Sort lock nodes lexicographically to find the smallest (oldest) node
                children.sort();

                const myNodeName = this.myNodePath.split("/").pop();
                const index = children.indexOf(myNodeName);

                if (index === -1)
                {
                    // Our node doesn't exist anymore (possibly due to session expiration)
                    return reject(new Error(`Lock node ${myNodeName} no longer exists`));
                }

                if (index === 0)
                {
                    // This node is the first in queue → lock acquired
                    console.log(`[Lock] ${myNodeName} acquired the lock.`);
                    resolve();
                }
                else
                {
                    // Watch the previous node for deletion
                    const prevNode = children[index - 1];
                    const prevNodePath = `${this.lockPath}/${prevNode}`;
                    console.log(`[Lock] ${myNodeName} is waiting for ${prevNode}`);

                    this.client.exists(
                        prevNodePath,
                        (event) =>
                        {
                            // Check if event exists and is the right type
                            if (event && event.getType() === zookeeper.Event.NODE_DELETED)
                            {
                                // When the previous node is deleted, retry acquisition
                                console.log(`[Lock] ${prevNode} deleted, ${myNodeName} retrying lock acquisition`);
                                this.tryAcquire(resolve, reject);
                            }
                        },
                        (err, stat) => 
                        {
                            if (err)
                            {
                                console.error(`[Lock] Error watching node ${prevNodePath}:`, err);
                                // If there's an error watching, retry after a short delay
                                setTimeout(() => this.tryAcquire(resolve, reject), 100);
                                return;
                            }

                            // If the previous node doesn't exist anymore, retry immediately
                            if (!stat)
                            {
                                console.log(`[Lock] ${prevNode} already deleted, ${myNodeName} retrying lock acquisition`);
                                this.tryAcquire(resolve, reject);
                            }
                        }
                    );
                }
            }
        );
    }
    /**
     * Releases the currently held lock by deleting this client's
     * ephemeral sequential node in ZooKeeper.
     * 
     * @returns {Promise<void>} Resolves when the lock is successfully released.
     */
    async releaseLock()
    {
        return new Promise((resolve, reject) =>
        {
            this.client.remove(this.myNodePath, (err) =>
            {
                if (err) return reject(err);
                console.log(`[Lock] Released lock: ${this.myNodePath}`);
                resolve();
            });
        });
    }
}

module.exports = DistributedLock;
