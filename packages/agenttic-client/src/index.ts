/**
 * @file agenttic-client
 *
 * A TypeScript client library for communication with WPcom Agent API
 */

// PRIMARY PUBLIC API - React hooks for external consumers
export { useClientContext } from './react/useClientContext';
export {
	useClientTools,
	useClientAbilities,
	useClientToolsWithAbilities,
	type UseClientToolsWithAbilitiesConfig,
} from './react/useClientTools';
export { useAgentChat } from './react/useAgentChat';

// Essential utilities for external consumers
export {
	createRequestId,
	createTaskId,
	createTextMessage,
	extractToolCallsFromMessage,
	extractTextFromMessage,
	createAbortController,
} from './client/utils/core';

// All type exports (safe to expose)
export type {
	// Core types
	JsonRpcId,
	JsonRpcRequest,
	JsonRpcResponse,
	JsonRpcError,
	TaskState,
	ContentType,
	TextPart,
	FilePart,
	DataPart,
	ToolDataPart,
	ToolCallDataPart,
	ContextDataPart,
	Part,
	Message,
	TaskStatus,
	Artifact,
	Task,
	MessageSendParams,
	SendMessageRequest,
	SendMessageResponse,
	TaskStatusUpdateEvent,
	TaskArtifactUpdateEvent,

	// Client types
	Client,
	AuthProvider,
	ClientConfig,
	SendMessageParams,
	TaskUpdate,

	// Tool types
	Tool,
	ToolProvider,
	ToolCallResult,

	// WordPress Abilities types
	Ability,
	ExecuteAbilityFunction,

	// Context types
	ClientContext,
	ContextProvider,
} from './client/types/index';

// useAgentChat types
export type {
	UseAgentChatConfig,
	UseAgentChatReturn,
	UIMessage,
	UIMessageAction,
	Suggestion,
	SuggestionOption,
	SubmitOptions,
} from './react/useAgentChat';

// Constants
export { ErrorCodes } from './client/types/index';

// Client creation function
export { createClient } from './client/index';

// Agent Manager - Functional singleton for managing agent instances
export { getAgentManager } from './react/agentManager';
export type { AgentManager, AgentManagerConfig } from './react/agentManager';

// Message actions
export { useMessageActions } from './message-actions';

// Auth providers (optional utilities)
export {
	createJetpackAuthProvider,
	type JetpackErrorHandler,
	type JetpackApiError,
} from './auth/jetpack';

// WordPress Abilities API integration utilities
export {
	convertAbilityToTool,
	convertAbilitiesToTools,
	isWordPressAbility,
} from './utils/wordpressAbilities';

export {
	listConversationsFromServer,
	loadChatFromServer,
	loadAllMessagesFromServer,
} from './react/odieService';
export type { OdieServiceConfig } from './react/odieService';
export type {
	ServerLoadResult,
	PaginationMeta,
	ServerConversationListItem,
	ServerConversationListItemMessage,
} from './react/serverTypes';

// Odie bot configuration utilities
export {
	createOdieBotId,
	parseOdieBotId,
	isOdieBotId,
} from './react/odieConfig';
export type { OdieBotConfig } from './react/odieConfig';

// Agents API REST adapter for WordPress-native chat surfaces.
export * from './agents-api';
