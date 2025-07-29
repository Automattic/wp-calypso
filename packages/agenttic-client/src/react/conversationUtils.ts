import type { DataPart, Message, TextPart } from '../client/types/index';
import { generateMessageId } from '../client/utils/core';

/**
 * Extract only the new content (non-history) parts from a message
 * This helps avoid storing history data parts in conversation history
 *
 * @param message - The message to extract new content from
 * @return A clean message with only new content parts
 */
export function extractNewContentFromMessage( message: Message ): Message {
	const newParts = message.parts.filter( ( part ) => {
		// Keep text parts as they represent the actual message content
		if ( part.type === 'text' ) {
			return true;
		}
		if ( part.type === 'data' ) {
			// EXCLUDE conversation history data parts (role + text combinations)
			if ( 'role' in part.data && 'text' in part.data ) {
				return false;
			}

			// INCLUDE tool calls (have toolCallId + toolId + arguments)
			if ( 'toolCallId' in part.data && 'arguments' in part.data ) {
				return true;
			}

			// INCLUDE tool results (have toolCallId + result)
			if ( 'toolCallId' in part.data && 'result' in part.data ) {
				return true;
			}

			// EXCLUDE tool definitions and context data (toolId without toolCallId, clientContext, etc.)
			// These are usually provided by the system and shouldn't be stored in conversation history
			return false;
		}
		return true;
	} );

	return {
		...message,
		parts: newParts,
		// Preserve metadata if it exists, otherwise add timestamp
		metadata: message.metadata || {
			timestamp: Date.now(),
		},
	};
}

/**
 * Convert conversation messages to data parts for history
 *
 * @param conversationMessages - Array of previous conversation messages
 * @return Array of data parts representing conversation history
 */
export function conversationMessagesToDataParts(
	conversationMessages: Message[]
): DataPart[] {
	const historyParts: DataPart[] = [];

	for ( const message of conversationMessages ) {
		for ( const part of message.parts ) {
			if ( part.type === 'text' ) {
				// Convert text parts to history data parts
				historyParts.push( {
					type: 'data',
					data: {
						role: message.role,
						text: ( part as TextPart ).text,
					},
				} );
			} else if ( part.type === 'data' ) {
				// Only pass through tool calls and tool results, NOT conversation history data parts
				// EXCLUDE conversation history data parts (role + text combinations)
				if ( 'role' in part.data && 'text' in part.data ) {
					continue; // Skip conversation history data parts
				}

				// INCLUDE tool calls (have toolCallId + arguments)
				if ( 'toolCallId' in part.data && 'arguments' in part.data ) {
					historyParts.push( part as DataPart );
					continue;
				}

				// INCLUDE tool results (have toolCallId + result)
				if ( 'toolCallId' in part.data && 'result' in part.data ) {
					historyParts.push( part as DataPart );
					continue;
				}

				// Skip all other data parts (tool definitions, context, etc.)
			}
		}
	}

	return historyParts;
}

/**
 * Create A2A message with conversation history from Message array
 *
 * @param text                 - The user text message to send
 * @param conversationMessages - Array of previous conversation messages
 * @return A2A Message with history and current text
 */
export function createTextMessageWithHistory(
	text: string,
	conversationMessages: Message[] = []
): Message {
	const historyParts =
		conversationMessagesToDataParts( conversationMessages );

	return {
		role: 'user',
		parts: [
			...historyParts,
			{
				type: 'text',
				text,
			} as TextPart,
		],
		kind: 'message',
		messageId: generateMessageId(),
		metadata: {
			timestamp: Date.now(),
		},
	};
}

/**
 * Extract tool results from a message
 *
 * @param message - The message to check for tool results
 * @return Array of tool result parts
 */
export function extractToolResultsFromMessage( message?: Message ): DataPart[] {
	if ( ! message?.parts ) {
		return [];
	}

	return message.parts.filter(
		( part: any ) =>
			part.type === 'data' &&
			'toolCallId' in part.data &&
			'result' in part.data
	) as DataPart[];
}
