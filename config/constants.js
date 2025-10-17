/**
 * Application configuration constants and environment variables
 * @module config/constants
 */

/**
 * The port number on which this replica's Express server will listen.
 * This value is provided by Docker via environment variables.
 * @constant {number}
 */
const PORT = process.env.PORT;

/**
 * The root path in ZooKeeper used to store all lock nodes.
 * @constant {string}
 */
const LOCK_PATH = "/locks";

/**
 * ZooKeeper host and port used for connection.
 * Defaults to the internal Docker service name `zookeeper:2181`.
 * @constant {string}
 */
const ZK_HOST = process.env.ZK_HOST;

/**
 * ZooKeeper client configuration options.
 * If you don't set these option, Zookeeper will server only one client and the others replica 
 * will disconnect with it as it's default maxCnxns is 0.
 * There's another way to solve this problem by setting maxCnxns with bigger value and you can 
 * do this by adding `zoo.cfg` file and mention it within `volumes` in your docker-compose.
 * @constant {Object}
 */
const ZK_OPTIONS = {
    sessionTimeout: 10000,
    spinDelay: 1000,
    retries: 3
};

module.exports = {
    PORT,
    LOCK_PATH,
    ZK_HOST,
    ZK_OPTIONS
};