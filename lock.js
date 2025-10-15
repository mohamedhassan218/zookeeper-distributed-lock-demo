// lock.js
const zookeeper = require("node-zookeeper-client");

class DistributedLock
{
    constructor(client, lockPath)
    {
        this.client = client;
        this.lockPath = lockPath;
        this.myNodePath = null;
    }

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

    tryAcquire(resolve, reject)
    {
        this.client.getChildren(
            this.lockPath,
            null,
            (err, children) =>
            {
                if (err) return reject(err);

                children.sort();
                const myNodeName = this.myNodePath.split("/").pop();
                const index = children.indexOf(myNodeName);

                if (index === 0)
                {
                    console.log(`[Lock] ${myNodeName} acquired the lock.`);
                    resolve();
                } else
                {
                    const prevNode = children[index - 1];
                    const prevNodePath = `${this.lockPath}/${prevNode}`;
                    console.log(`[Lock] ${myNodeName} is waiting for ${prevNode}`);

                    this.client.exists(prevNodePath, (event) =>
                    {
                        if (event.getType() === zookeeper.Event.NODE_DELETED)
                        {
                            this.tryAcquire(resolve, reject);
                        }
                    });
                }
            }
        );
    }

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