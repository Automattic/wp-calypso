// Main component exports
export { default } from './components/agents-manager';
export type { AgentsManagerProps } from './components/agents-manager';

export { AGENTS_MANAGER_STORE } from './stores';

// Utility for agents manager inline data
export { getAgentsManagerInlineData } from './utils/get-agents-manager-inline-data';

// Tracks wrapper, so entry points outside the package attach the unified base props
export { recordFullNameAgentsManagerTracksEvent } from './utils/tracks';

// Host-facing controls for the chat dock, for entry points outside it
export {
	closeAgentsManagerChat,
	getAgentsManagerChatRoute,
	isAgentsManagerChatVisible,
	openAgentsManagerChat,
} from './utils/chat-actions';

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

// Feedback exports
export {
	default as useFeedbackAction,
	submitFeedback,
	rateMessage,
} from './hooks/use-feedback-action';
export type { UseFeedbackActionConfig, UseFeedbackActionReturn } from './hooks/use-feedback-action';
export { default as FeedbackInput } from './components/feedback-input';
