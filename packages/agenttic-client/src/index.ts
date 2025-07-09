/**
 * @file agenttic-client
 *
 * A TypeScript client library for communication with WPcom Agent API
 */

// PRIMARY PUBLIC API - React hooks for external consumers
export { useAgent } from './react/useAgent';
export { useClientContext } from './react/useClientContext';
export { useClientTools } from './react/useClientTools';

// Essential utilities for external consumers
export {
	createRequestId,
	createTaskId,
	createTextMessage,
	extractToolCallsFromMessage,
	extractTextFromMessage,
} from './client/utils/core';

// All type exports (safe to expose)
export type {
	// Core A2A types
	JsonRpcId,
	JsonRpcRequest,
	JsonRpcResponse,
	JsonRpcError,
	TaskState,
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

	// Context types
	ClientContext,
	ContextProvider,
} from './client/types/index';

// React hook types
export type {
	UseAgentConfig,
	AgentState,
	UseAgentReturn,
	ChatMessage,
} from './react/useAgent';

// Constants
export { A2AErrorCodes } from './client/types/index';

// Client creation function
export { createClient } from './client/index';

// Agent Manager - Functional singleton for managing agent instances
export { getAgentManager } from './react/agentManager';
export type { AgentManager, AgentManagerConfig } from './react/agentManager';
