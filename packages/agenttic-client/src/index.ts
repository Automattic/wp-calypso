/**
 * @file agenttic-client
 *
 * A TypeScript client library for communication with WPcom Agent API
 */

// Core client exports
export { createClient, sendMessageAndWait } from './client/index';

// Type exports
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
	TaskSendParams,
	SendTaskRequest,
	SendTaskResponse,
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

// Utility exports
export {
	createRequestId,
	createTaskId,
	createTextPart,
	createSendTaskRequest,
	extractTextFromMessage,
	createToolDataPart,
	extractToolCallsFromMessage,
	createToolResultDataPart,
	createContextDataPart,
} from './client/utils/index';

// Streaming exports
export {
	parseStreamChunk,
	parseSSEStream,
	streamToTask,
} from './client/utils/streaming';

// Auth provider exports
export { createEnvAuthProvider } from './cli/auth';

// CLI tool provider exports
export { createCLIToolProvider, createExampleTools } from './cli/tools';
export type { SendToolResultCallback } from './cli/tools';

// CLI context provider exports
export { CLIContextProvider, createCLIContextProvider } from './cli/context';

// React hook exports
export { useAgent } from './react/useAgent';
export { useClientContext } from './react/useClientContext';
export { useClientTools } from './react/useClientTools';
export type {
	UseAgentConfig,
	AgentState,
	UseAgentReturn,
} from './react/useAgent';

// Constants
export { A2AErrorCodes } from './client/types/index';

// CLI types (for programmatic usage)
export type {
	CLIOptions,
	CLIAuthOptions,
	InteractiveSession,
} from './cli/types';
