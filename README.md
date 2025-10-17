# Zookeeper Distributed Locking Demo
This demo demonstrates a distributed locking mechanism using **Apache ZooKeeper** to coordinate access between multiple API replicas trying to write to a shared text file.

In distributed systems, multiple services may attempt to modify shared data at the same time. This demo shows how ZooKeeper can help coordinate access and prevent race conditions by implementing a distributed lock.

Each API replica connects to ZooKeeper, attempts to acquire a lock, writes to a shared file, and then releases the lock so the next replica can proceed.

I've made this repo to get my hands-on the practical details after I've written this [article](https://medium.com/@m.hassan.def/distributed-locking-using-zookeeper-e6ec7d84feb3).


## Running the Demo

1. Clone the repo:
   ```bash
   git clone git@github.com:mohamedhassan218/zookeeper-distributed-lock-demo.git
   cd zookeeper-distributed-lock-demo/
   ```
2. Install Node dependencies:
   ```bash
   npm install
   ```
3. Build & run the docker-compose file:
   ```bash
   docker-compose up --build
   ```

4. Test the code by sending three requests to the three replicas and see the results:
   ```bash
   node script.js
   ```

## The Expected Behavior

Only one replica at a time acquires the lock and writes to the shared file and other replicas wait until the lock becomes available.
Logs clearly show the order in which replicas acquired and released the lock.
You can check the `shared.txt` file in the project directory. We predict a result like:
```text
Replica a3916c28766e sent their regards at 10/17/2025, 12:44:08.
Replica 9987420ebfd7 sent their regards at 10/17/2025, 12:44:10.
Replica 3df6ade40a74 sent their regards at 10/17/2025, 12:44:12.
```

**Important Note: you must create your `shared.txt` file before build-up your docker-compose file.**