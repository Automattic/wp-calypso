// Main component exports
export { default } from './components/agents-manager';
export type { AgentsManagerProps } from './components/agents-manager';
export { default as HeadlessAgentInitializer } from './components/headless-agent-initializer';
export type { HeadlessAgentInitializerProps } from './components/headless-agent-initializer';

export { AGENTS_MANAGER_STORE } from './stores';

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
