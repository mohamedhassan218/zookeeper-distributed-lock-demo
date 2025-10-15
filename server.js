const fs = require("fs");
const zookeeper = require("node-zookeeper-client");
const DistributedLock = require("./lock");
const express = require('express');

// To extract replica ID
const os = require("os");

const REPLICA_ID = getReplicaId();
const PORT = 3000 + parseInt(REPLICA_ID);
const LOCK_PATH = "/locks";
const ZK_HOST = process.env.ZK_HOST || "zookeeper:2181";

const client = zookeeper.createClient(ZK_HOST);
const app = express();

client.once("connected", async () =>
{
    console.log(`[Replica ${REPLICA_ID}] Connected to ZooKeeper`);
    ensureLockPath(() =>
    {
        app.listen(PORT, () => console.log(`Replica ${REPLICA_ID} running on port ${PORT}`));
    });
});

client.connect();

function ensureLockPath(callback)
{
    client.exists(LOCK_PATH, (err, stat) =>
    {
        if (stat) return callback();
        client.create(LOCK_PATH, (err2) =>
        {
            if (!err2 || err2.getCode() === zookeeper.Exception.NODE_EXISTS) callback();
            else console.error("Failed to ensure lock path:", err2);
        });
    });
}

app.post("/write", async (req, res) =>
{
    const lock = new DistributedLock(client, LOCK_PATH);
    try
    {
        await lock.acquireLock();

        fs.appendFileSync("shared.txt", `Replica ${REPLICA_ID} sends their regards.\n`);
        console.log(`[Replica ${REPLICA_ID}] Wrote to file.`);

        await lock.releaseLock();
        res.send(`Replica ${REPLICA_ID} write complete.`);
    } catch (err)
    {
        console.error(err);
        res.status(500).send("Error acquiring lock.");
    }
});


function getReplicaId()
{
    // Example: hostname() returns "zookeeper-lock-demo-replica-1"
    const hostname = os.hostname();

    // Try to extract the trailing number
    const match = hostname.match(/(\d+)$/);
    const REPLICA_ID = match ? parseInt(match[1]) : 1;
    return REPLICA_ID;
}