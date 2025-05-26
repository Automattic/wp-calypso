/**
 * @automattic/agenttic-client
 *
 * A TypeScript client library for A2A (Agent2Agent) protocol communication
 */

// Core client exports
export { createA2AClient, sendMessageAndWait } from './client/index.js';

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
} from './types/index.js';

// Utility exports
export {
	createRequestId,
	createTaskId,
	createTextPart,
	createTextMessage,
	createSendTaskRequest,
	extractTextFromMessage,
} from './utils/index.js';

// Streaming exports
export {
	parseStreamChunk,
	parseSSEStream,
	streamToTask,
} from './streaming/index.js';

// Auth provider exports
export { createEnvAuthProvider } from './cli/auth.js';

// Constants
export { A2AErrorCodes } from './types/index.js';

// CLI types (for programmatic usage)
export type {
	CLIOptions,
	CLIAuthOptions,
	InteractiveSession,
} from './cli/types.js';
