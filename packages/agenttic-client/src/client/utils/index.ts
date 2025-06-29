// Re-export core utilities
export {
	createRequestId,
	createTaskId,
	createTextPart,
	createSendTaskRequest,
	extractTextFromMessage,
	extractToolCallsFromMessage,
	createToolDataPart,
	createToolResultDataPart,
	createContextDataPart,
	createTextMessage,
	createAgentTextMessage,
	createToolResultMessage,
	processToolExecutionResult,
	generateMessageId,
} from './core';

// Re-export internal utilities
export {
	executeRequest,
	executeStreamingRequest,
	prepareRequest,
	type RequestConfig,
	type RequestOptions,
} from './internal/requests';

export {
	parseStreamChunk,
	parseSSEStream,
	streamToTask,
} from './internal/streaming';

export {
	enhanceMessage,
	enhanceMessageWithTools,
	enhanceMessageWithContext,
} from './internal/messages';

export { getToolCallCount, hasToolCalls } from './internal/tools';

export {
	createTimeoutHandler,
	handleRequestError,
	validateHttpResponse,
	validateJsonRpcResponse,
	validateStreamingResponse,
} from './internal/errors';

// Re-export logger utilities (unchanged)
export { logger, isDebugEnabled, enableDebug, formatObject } from './logger';
