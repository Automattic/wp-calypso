import { v4 as uuidv4 } from 'uuid';
import type {
	ConversationHistoryPart,
	JsonRpcId,
	Message,
	SendTaskRequest,
	TaskSendParams,
	TextPart,
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
export function extractTextFromMessage( message?: Message ): string {
	if ( ! message || ! message.parts || ! Array.isArray( message.parts ) ) {
		return '';
	}

	return message.parts
		.filter( ( part ) => part.type === 'text' )
		.map( ( part ) => ( part as TextPart ).text )
		.join( '\n' );
}

// Re-export logger utilities for convenience
export { logger, isDebugEnabled, enableDebug, formatObject } from './logger';
