/**
 * Browser stub for Node's `worker_threads` module.
 * Used when bundling @php-wasm/universal for the client; worker_threads is Node-only.
 */
module.exports = {
	receiveMessageOnPort: () => undefined,
};
