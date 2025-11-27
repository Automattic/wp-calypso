// Main component exports
export { default } from './components/unified-ai-agent';
export type { UnifiedAIAgentProps } from './components/unified-ai-agent';

export { AGENTS_MANAGER_STORE } from './stores';

// Extension API types for other plugins to hook into
export type {
	ToolProvider,
	ContextProvider,
	ClientContextType,
	BaseContextEntry,
	ContextEntry,
	Ability,
	Suggestion,
} from './types';
