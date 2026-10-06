// Main component exports
export { default } from './components/agents-manager';
export type { AgentsManagerProps } from './components/agents-manager';

export { AGENTS_MANAGER_STORE } from './stores';

// Utility for agents manager inline data
export { getAgentsManagerInlineData } from './utils/get-agents-manager-inline-data';

// Tracks wrapper, so entry points outside the package attach the shared base props
export { recordAgentsManagerTracksEvent } from './utils/tracks';

// Host-facing controls for the chat dock, for entry points outside it
export {
	closeAgentsManagerChat,
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

export { useAiChatEntryState } from './hooks/use-ai-chat-entry-state';
export { default as AiChatEntryLabel } from './components/ai-chat-entry-label';

// Feedback exports
export {
	default as useFeedbackAction,
	submitFeedback,
	rateMessage,
} from './hooks/use-feedback-action';
export type { UseFeedbackActionConfig, UseFeedbackActionReturn } from './hooks/use-feedback-action';
export { default as FeedbackInput } from './components/feedback-input';

// Site credits copy, so other chats show the same amounts and low-balance limit
export { CREDITS_LOW_BALANCE, formatCreditsShort } from './utils/credits';

// Site credits ring, for chats outside the dock that show the same balance
export { default as CreditsMeter } from './components/credits-meter';
export { buildLiveCreditsStatus, parseCreditSnapshot } from './utils/live-credits';
export type { CreditsStatus } from './utils/credits';
