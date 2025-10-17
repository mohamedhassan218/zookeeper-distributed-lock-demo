/**
 * Main server entry point for distributed lock demo
 * @module server
 */

const express = require('express');
const os = require("os");

// Import modules
const { PORT } = require("./config/constants");
const { createZooKeeperClient } = require("./zookeeper/client");
const { ensureLockPath } = require("./zookeeper/lock-manager");
const { createWriteHandler } = require("./routes/write");
const { spinForSeconds } = require("./utils/helpers");

/**
 * =============================
 * Application Initialization
 * =============================
 */

// Initialize Express application
const app = express();

// Create ZooKeeper client
const client = createZooKeeperClient();

/**
 * =============================
 * ZooKeeper Connection Setup
 * =============================
 */

/**
 * Event listener that runs once the ZooKeeper connection is established.
 * It ensures the existence of the lock path before starting the API server.
 */
client.once("connected", async () =>
{
    console.log(`[Replica ${os.hostname()}] Connected to ZooKeeper`);

    ensureLockPath(client, () =>
    {
        // Setup routes
        app.post("/write", createWriteHandler(client));

        // Start server
        app.listen(PORT, () =>
        {
            console.log(`Replica ${os.hostname()} running on port ${PORT}`);
        });
    });
});

/**
 * =============================
 * Server Startup
 * =============================
 */

/**
 * Spin for four seconds until ZooKeeper instance finishes booting up.
 * If you don't spin here, the replicas try to connect once they up before ZooKeeper
 * server finishes initialization which causes error: java.io.IOException: ZooKeeperServer not running.
 */
spinForSeconds(4);
client.connect();