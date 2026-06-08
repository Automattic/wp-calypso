import type {
	DataPart,
	FilePart,
	Message,
	TextPart,
} from '../client/types/index';
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

			// INCLUDE escalations to human support
			if (
				'flags' in part.data &&
				part.data.flags &&
				typeof part.data.flags === 'object' &&
				'forward_to_human_support' in part.data.flags
			) {
				return true;
			}

			// INCLUDE sources for article references
			if (
				'sources' in part.data &&
				Array.isArray( part.data.sources ) &&
				part.data.sources.length > 0
			) {
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
): ( DataPart | FilePart )[] {
	const historyParts: ( DataPart | FilePart )[] = [];

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
			} else if ( part.type === 'file' ) {
				// INCLUDE file parts in history so uploaded files persist across messages
				historyParts.push( part as FilePart );
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
 * Image data with optional metadata (e.g., WordPress attachment ID)
 */
export interface ImageData {
	url: string;
	metadata?: Record< string, unknown >;
}

/**
 * Create message with conversation history from Message array
 *
 * @param text                 - The user text message to send
 * @param conversationMessages - Array of previous conversation messages
 * @param imageUrls            - Array of image URLs or image objects with metadata
 * @return Message with history and current text
 */
export function createTextMessageWithHistory(
	text: string,
	conversationMessages: Message[] = [],
	imageUrls: ( string | ImageData )[] = []
): Message {
	const historyParts =
		conversationMessagesToDataParts( conversationMessages );

	const imageParts: FilePart[] = imageUrls.map( ( imageData ) => {
		// Handle both string URLs and ImageData objects
		const url = typeof imageData === 'string' ? imageData : imageData.url;
		const metadata =
			typeof imageData === 'object' ? imageData.metadata : undefined;

		// Get mimeType from metadata if available, otherwise default to image/jpeg
		const mimeType = ( metadata?.fileType as string ) || 'image/jpeg';
		const fileName = ( metadata?.fileName as string ) || 'image';

		return {
			type: 'file',
			file: {
				name: fileName,
				mimeType,
				uri: url,
			},
			metadata,
		};
	} );

	return {
		role: 'user',
		parts: [
			...historyParts,
			{
				type: 'text',
				text,
			} as TextPart,
			...imageParts,
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

/**
 * Whether a message's leading text part is a complete tool payload — a JSON
 * `agentMessage` of the shape `{ tool_id, data }` that a tool returned for the
 * UI to render (e.g. a picker). Used to decide whether an interim streaming
 * update carries a renderable component that should be appended to history.
 *
 * This deliberately matches only a fully-formed payload (parses to an object
 * with a string `tool_id`), so partial text from token-streaming agents — which
 * is plain prose, not JSON — is ignored.
 *
 * @param message - The message to inspect.
 * @return True when the first text part is a `{ tool_id, ... }` JSON payload.
 */
export function messageCarriesToolPayload( message?: Message ): boolean {
	const text = message?.parts?.find(
		( part ): part is TextPart => part.type === 'text'
	)?.text;
	if ( typeof text !== 'string' || text.trim() === '' ) {
		return false;
	}

	try {
		const parsed = JSON.parse( text );
		return (
			!! parsed &&
			typeof parsed === 'object' &&
			typeof parsed.tool_id === 'string'
		);
	} catch ( _error ) {
		return false;
	}
}
