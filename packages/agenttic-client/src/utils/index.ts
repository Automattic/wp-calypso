import { v4 as uuidv4 } from 'uuid';
import type {
	ClientContext,
	ContextDataPart,
	ConversationHistoryPart,
	DataPart,
	JsonRpcId,
	Message,
	SendTaskRequest,
	TaskSendParams,
	TextPart,
	Tool,
	ToolCallDataPart,
	ToolDataPart,
} from '../types/index';

import type { ConversationHistoryItem } from '../cli/types';

/**
 * Generate a random string for IDs using UUID
 */
function generateRandomId(): string {
	return uuidv4();
}

/**
 * Creates a unique request ID for A2A requests
 */
export function createRequestId(): JsonRpcId {
	return `req-${ generateRandomId() }`;
}

/**
 * Creates a unique task ID for A2A tasks
 */
export function createTaskId(): string {
	return `task-${ generateRandomId() }`;
}

/**
 * Create a simple text part for a message
 * @param text
 */
export function createTextPart( text: string ): TextPart {
	return {
		type: 'text',
		text,
	};
}

/**
 * Create a simple user message with a text part
 * @param text
 * @param conversationHistory
 */
export function createTextMessage(
	text: string,
	conversationHistory: ConversationHistoryItem[] = []
): Message {
	return {
		role: 'user',
		parts: [
			...conversationHistory.map( ( item ) => {
				return < ConversationHistoryPart >{
					type: 'data',
					data: {
						role: item.role,
						text: item.text,
					},
				};
			} ),
			createTextPart( text ),
		],
	};
}

/**
 * Create a tasks/send request payload
 * @param params
 * @param method
 */
export function createSendTaskRequest(
	params: TaskSendParams,
	method: string = 'tasks/send'
): SendTaskRequest {
	return {
		jsonrpc: '2.0',
		id: createRequestId(),
		method,
		params: {
			id: params.id || createTaskId(),
			...params,
		},
	};
}

/**
 * Extract text content from a message
 * @param message
 */
export function extractTextFromMessage( message: Message ): string {
	if ( ! message || ! message.parts || ! Array.isArray( message.parts ) ) {
		return '';
	}

	return message.parts
		.filter( ( part ): part is TextPart => part.type === 'text' )
		.map( ( part ) => part.text )
		.join( ' ' );
}

/**
 * Create a ToolDataPart from a Tool
 * @param tool
 */
export function createToolDataPart( tool: Tool ): ToolDataPart {
	return {
		type: 'data',
		data: {
			toolId: tool.id,
			toolName: tool.name,
			description: tool.description,
			inputSchema: tool.input_schema,
		},
		metadata: {},
	};
}

/**
 * Extract tool calls from a message
 * @param message
 */
export function extractToolCallsFromMessage(
	message: Message
): ToolCallDataPart[] {
	return message.parts.filter(
		( part ): part is ToolCallDataPart =>
			part.type === 'data' &&
			'toolCallId' in part.data &&
			'toolId' in part.data &&
			'arguments' in part.data
	);
}

/**
 * Create a tool result data part
 * @param toolCallId
 * @param toolId
 * @param result
 * @param error
 */
export function createToolResultDataPart(
	toolCallId: string,
	toolId: string,
	result: any,
	error?: string
): DataPart {
	return {
		type: 'data',
		data: {
			toolCallId,
			toolId,
			result: error ? undefined : result,
			error,
		},
		metadata: {},
	};
}

/**
 * Create a context data part from client context
 * @param clientContext
 */
export function createContextDataPart(
	clientContext: ClientContext
): ContextDataPart {
	return {
		type: 'data',
		data: {
			clientContext,
		},
		metadata: {},
	};
}

// Re-export logger utilities for convenience
export { logger, isDebugEnabled, enableDebug, formatObject } from './logger';

// Re-export message enhancement utilities
export {
	enhanceMessage,
	enhanceMessageWithTools,
	enhanceMessageWithContext,
} from './messages';

// Re-export request utilities
export {
	executeRequest,
	executeStreamingRequest,
	prepareRequest,
	type RequestConfig,
	type RequestOptions,
} from './requests';

// Re-export tool utilities
export {
	getToolCallCount,
	hasToolCalls,
	processTaskToolCalls,
	processToolCallsAsync,
} from './tools';
