/**
 * Utility functions and helpers
 * @module utils/helpers
 */

/**
 * Blocks the event loop for specified seconds.
 * Used here to simulate a time-consuming operation
 * to test distributed lock contention between replicas.
 * 
 * @param {number} duration - Duration in seconds to spin
 */
function spinForSeconds(duration)
{
    const end = Date.now() + duration * 1000;
    while (Date.now() < end) { }
}

module.exports = {
    spinForSeconds
};