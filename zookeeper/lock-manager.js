/**
 * ZooKeeper lock path management utilities
 * @module zookeeper/lock-manager
 */

const zookeeper = require("node-zookeeper-client");
const { LOCK_PATH } = require("../config/constants");

/**
 * Ensures that the root lock path exists in ZooKeeper.
 * If it doesn't exist, this function creates it.
 *
 * @param {object} client - ZooKeeper client instance
 * @param {Function} callback - Function to execute after the path is ensured
 */
function ensureLockPath(client, callback)
{
    client.exists(LOCK_PATH, (err, stat) =>
    {
        if (stat) return callback();

        client.create(LOCK_PATH, (err2) =>
        {
            if (!err2 || err2.getCode() === zookeeper.Exception.NODE_EXISTS)
            {
                callback();
            } else
            {
                console.error("Failed to ensure lock path:", err2);
            }
        });
    });
}

module.exports = {
    ensureLockPath
};