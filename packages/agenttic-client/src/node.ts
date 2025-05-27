// Node.js-specific entry point
// This includes Node.js-specific dependencies like fetch-socks

export * from './index';

// Re-export Node.js-specific dispatcher
export { NodeDispatcher, nodeDispatcher } from './cli/dispatcher';
