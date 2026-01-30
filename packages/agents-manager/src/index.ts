// Main component exports
export { default } from './components/agents-manager';
export { default as UnifiedAIAgent } from './components/unified-ai-agent';
export type { UnifiedAIAgentProps } from './components/unified-ai-agent';

export { AGENTS_MANAGER_STORE } from './stores';

// Context exports
export { useAgentsManagerContext, type AgentsManagerContextType } from './contexts';

// Utility for checking unified experience from inline script data
export { getUseUnifiedExperienceFromInlineData } from './utils/load-external-providers';

// Extension API types for other plugins to hook into
export type {
	Ability,
	ToolProvider,
	ContextProvider,
	ClientContextType,
	BaseContextEntry,
	ContextEntry,
	Suggestion,
} from './types';

export { useShouldUseUnifiedAgent } from './hooks/use-should-use-unified-agent';
