// Browser-specific entry point
// This ensures that only browser-compatible code is included in browser builds

export * from './index';

// Re-export browser-specific dispatcher
export {
	BrowserDispatcher,
	defaultDispatcher,
} from './client/utils/dispatcher';

// Re-export React hook for browser usage
export { useAgent } from './react/useAgent';
export type {
	UseAgentConfig,
	AgentState,
	UseAgentReturn,
} from './react/useAgent';

export { useClientContext } from './react/useClientContext';
export type { GetClientContextCallback } from './react/useClientContext';

export { useClientTools } from './react/useClientTools';
export type {
	GetClientToolsCallback,
	ExecuteToolCallback,
} from './react/useClientTools';
