// Main component exports
export { default } from './components/agents-manager';

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
	ToolProvider,
	ContextProvider,
	ClientContextType,
	BaseContextEntry,
	ContextEntry,
} from './types';
export type { Ability } from '@wordpress/abilities';
export type { Suggestion } from '@automattic/agenttic-ui';

export { useAiChatEntryState } from './hooks/use-ai-chat-entry-state';
export { default as AiChatEntryLabel } from './components/ai-chat-entry-label';

// Feedback exports
export { submitFeedback, rateMessage } from './hooks/use-feedback-action';
export { default as FeedbackInput } from './components/feedback-input';
export { default as useAgentTraceIds } from './hooks/use-agent-trace-ids';

// Site credits copy, so other chats show the same amounts and low-balance limit
export { CREDITS_LOW_BALANCE, formatCreditsShort } from './utils/credits';
// The top-ups balance and agent environment the credits Tracks events send, so other chats send the same values
export { getAgentEnvironment, getTopUpCreditsLeft } from './utils/credits';

// Site credits meter, for chats outside the dock that show the same balance
export { default as CreditsMeter } from './components/credits-meter';
export {
	CREDITS_UPGRADE_SOURCE,
	getCreditsPurchaseLink,
	parseLiveCreditsStatus,
} from './utils/live-credits';
// Who may buy, and what to tell everyone else, so every chat offers Upgrade or Add credits the same way
export {
	getCreditsCtaType,
	getCreditsNoticeMessage,
	getCreditsPurchaseAction,
	getCreditsPurchaseOptions,
	parseCreditsAccess,
} from './utils/credits-access';
export type { CreditsStatus } from './utils/credits';
export type { CreditsPurchaseKind, CreditsPurchaseLink } from './utils/live-credits';
export type {
	CreditsAccess,
	CreditsCtaType,
	CreditsPurchaseAction,
	CreditsPurchaseOptions,
} from './utils/credits-access';
