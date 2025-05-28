/**
 * @file agenttic-client
 *
 * A TypeScript client library for A2A (Agent2Agent) protocol communication
 */

// Core client exports
export { createA2AClient, sendMessageAndWait } from './client/index';

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
	A2AClient,
	AuthProvider,
	A2AClientConfig,
	SendMessageParams,
	TaskUpdate,

	// Tool types
	Tool,
	ToolProvider,
	ToolCallResult,

	// Context types
	ClientContext,
	ContextProvider,
} from './types/index';

// Utility exports
export {
	createRequestId,
	createTaskId,
	createTextPart,
	createTextMessage,
	createSendTaskRequest,
	extractTextFromMessage,
	createToolDataPart,
	extractToolCallsFromMessage,
	createToolResultDataPart,
	createContextDataPart,
} from './utils/index';

// Streaming exports
export {
	parseStreamChunk,
	parseSSEStream,
	streamToTask,
} from './streaming/index';

// Auth provider exports
export { createEnvAuthProvider } from './cli/auth';

// CLI tool provider exports
export { createCLIToolProvider, createExampleTools } from './cli/tools';
export type { SendToolResultCallback } from './cli/tools';

// CLI context provider exports
export { CLIContextProvider, createCLIContextProvider } from './cli/context';

// Constants
export { A2AErrorCodes } from './types/index';

// CLI types (for programmatic usage)
export type {
	CLIOptions,
	CLIAuthOptions,
	InteractiveSession,
} from './cli/types';
