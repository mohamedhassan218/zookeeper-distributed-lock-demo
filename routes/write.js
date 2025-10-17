/**
 * Write endpoint handler for shared resource operations
 * @module routes/write
 */

const fs = require("fs");
const os = require("os");
const DistributedLock = require("./utils/lock");
const { formatter } = require("../utils/formatter");
const { spinForSeconds } = require("../utils/helpers");
const { LOCK_PATH } = require("../config/constants");

/**
 * POST /write endpoint handler
 * 
 * Simulates a shared write operation across multiple replicas.
 * Uses ZooKeeper-based distributed locking to ensure only one replica writes
 * to the shared file at a time.
 *
 * Workflow:
 * 1. Acquire the distributed lock.
 * 2. Append a message to `shared.txt` with the current timestamp.
 * 3. Simulate a 2-second processing time.
 * 4. Release the lock and return success response.
 * 
 * @param {object} client - ZooKeeper client instance
 * @returns {Function} Express route handler
 */
function createWriteHandler(client)
{
    return async (req, res) =>
    {
        const lock = new DistributedLock(client, LOCK_PATH);

        try
        {
            await lock.acquireLock();

            fs.appendFileSync(
                "shared.txt",
                `Replica ${os.hostname()} sent their regards at ${formatter.format(new Date())}.\n`
            );
            console.log(`[Replica ${os.hostname()}] Wrote to file.`);

            // To simulate processing something & to ensure the locking happens correctly 
            // via the logs in the shared file.
            spinForSeconds(2);

            await lock.releaseLock();
            res.send(`Replica ${os.hostname()} write complete.`);
        } catch (err)
        {
            console.error(err);
            res.status(500).send("Error acquiring lock.");
        }
    };
}

module.exports = {
    createWriteHandler
};