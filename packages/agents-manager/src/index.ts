// Main component exports
export { default } from './components/unified-ai-agent';
export type { UnifiedAIAgentProps } from './components/unified-ai-agent';

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
