/**
 * ZooKeeper client initialization and connection management
 * @module zookeeper/client
 */

const zookeeper = require("node-zookeeper-client");
const { ZK_HOST, ZK_OPTIONS } = require("../config/constants");

/**
 * Creates and configures a ZooKeeper client instance
 * @returns {object} ZooKeeper client instance
 */
function createZooKeeperClient()
{
    return zookeeper.createClient(ZK_HOST, ZK_OPTIONS);
}

module.exports = {
    createZooKeeperClient
};