import type { DataPart, Message, TextPart } from '../client/types/index';
import { logger } from '../client/utils/logger';
import { generateMessageId } from '../client/utils/core';

const STORAGE_KEY = 'a8c_agenttic_conversation_history';

/**
 * Simplified stored message format for efficient serialization
 */
interface StoredMessage {
	role: 'user' | 'agent';
	content: string;
	timestamp: number;
	toolCalls?: Array< {
		toolCallId: string;
		toolId: string;
		arguments: Record< string, unknown >;
	} >;
	toolResults?: Array< {
		toolCallId: string;
		result: any;
		error?: string;
	} >;
}

/**
 * Stored conversation format
 */
interface StoredConversation {
	storageKey: string;
	messages: StoredMessage[];
	lastUpdated: number;
}

/**
 * Extract only essential content from a Message for storage
 * @param message - The Message to extract content from
 */
function extractStorableContent( message: Message ): StoredMessage {
	// Extract text content
	const textParts = message.parts
		.filter( ( part ): part is TextPart => part.type === 'text' )
		.map( ( part ) => part.text )
		.join( '\n' );

	// Extract tool calls
	const toolCalls = message.parts
		.filter(
			( part ): part is DataPart =>
				part.type === 'data' &&
				'toolCallId' in part.data &&
				'arguments' in part.data
		)
		.map( ( part ) => ( {
			toolCallId: part.data.toolCallId as string,
			toolId: part.data.toolId as string,
			arguments: part.data.arguments as Record< string, unknown >,
		} ) );

	// Extract tool results
	const toolResults = message.parts
		.filter(
			( part ): part is DataPart =>
				part.type === 'data' &&
				'toolCallId' in part.data &&
				'result' in part.data
		)
		.map( ( part ) => ( {
			toolCallId: part.data.toolCallId as string,
			result: part.data.result,
			error: part.data.error as string | undefined,
		} ) );

	// Determine the role - if this message contains tool interactions, store as "agent"
	// regardless of the original message role
	const hasToolInteractions = toolCalls.length > 0 || toolResults.length > 0;
	const storageRole = hasToolInteractions ? 'agent' : message.role;

	return {
		role: storageRole,
		content: textParts || '(No text content)',
		timestamp: Date.now(),
		...( toolCalls.length > 0 && { toolCalls } ),
		...( toolResults.length > 0 && { toolResults } ),
	};
}

/**
 * Convert stored message back to Message format
 * @param stored - The StoredMessage to restore
 */
function restoreMessage( stored: StoredMessage ): Message {
	const parts: Message[ 'parts' ] = [];

	// Add text part
	if ( stored.content && stored.content !== '(No text content)' ) {
		parts.push( {
			type: 'text',
			text: stored.content,
		} );
	}

	// Add tool call parts
	if ( stored.toolCalls ) {
		for ( const toolCall of stored.toolCalls ) {
			parts.push( {
				type: 'data',
				data: {
					toolCallId: toolCall.toolCallId,
					toolId: toolCall.toolId,
					arguments: toolCall.arguments,
				},
			} );
		}
	}

	// Add tool result parts
	if ( stored.toolResults ) {
		for ( const toolResult of stored.toolResults ) {
			parts.push( {
				type: 'data',
				data: {
					toolCallId: toolResult.toolCallId,
					result: toolResult.result,
					...( toolResult.error && { error: toolResult.error } ),
				},
			} );
		}
	}

	return {
		role: stored.role,
		kind: 'message',
		parts,
		messageId: generateMessageId(),
	};
}

// Module-level cache for conversation storage
const conversationCache = new Map< string, Message[] >();
const maxCacheSize = 50; // Limit number of cached conversations

/**
 * Store conversation messages for a session
 * @param sessionId              - The session ID to store messages for
 * @param messages               - The array of messages to store
 * @param conversationStorageKey - Optional custom storage key, defaults to sessionId
 */
export async function storeConversation(
	sessionId: string,
	messages: Message[],
	conversationStorageKey?: string
): Promise< void > {
	// Determine effective storage key
	const currentStorageKey = conversationStorageKey || sessionId;

	// Update in-memory cache
	conversationCache.set( currentStorageKey, [ ...messages ] );

	// Maintain cache size limit
	if ( conversationCache.size > maxCacheSize ) {
		const firstKey = conversationCache.keys().next().value;
		if ( firstKey ) {
			conversationCache.delete( firstKey );
		}
	}

	// Ignore TypeScript error for environments where sessionStorage might not be available
	// @ts-ignore
	if ( typeof sessionStorage === 'undefined' ) {
		// Handle case where sessionStorage is not available
		return;
	}

	try {
		// Serialize and store in sessionStorage
		const stored: StoredConversation = {
			storageKey: currentStorageKey,
			messages: messages.map( extractStorableContent ),
			lastUpdated: Date.now(),
		};

		// @ts-ignore
		sessionStorage.setItem(
			`${ STORAGE_KEY }_${ currentStorageKey }`,
			JSON.stringify( stored )
		);
	} catch ( error ) {
		// Handle sessionStorage quota exceeded or other errors
		logger(
			'Failed to store conversation in sessionStorage for key %s: %O',
			currentStorageKey,
			error
		);
	}
}

/**
 * Load conversation messages for a session
 * @param sessionId              - The session ID to load messages for
 * @param conversationStorageKey - Optional custom storage key, defaults to sessionId
 */
export async function loadConversation(
	sessionId: string,
	conversationStorageKey?: string
): Promise< Message[] > {
	// Determine effective storage key
	const currentStorageKey = conversationStorageKey || sessionId;

	// Check in-memory cache first
	if ( conversationCache.has( currentStorageKey ) ) {
		return [ ...conversationCache.get( currentStorageKey )! ];
	}

	// Fallback to sessionStorage
	// @ts-ignore
	if ( typeof sessionStorage === 'undefined' ) {
		// Handle case where sessionStorage is not available
		return [];
	}

	try {
		// @ts-ignore
		const stored = sessionStorage.getItem(
			`${ STORAGE_KEY }_${ currentStorageKey }`
		);
		if ( stored ) {
			const conversation: StoredConversation = JSON.parse( stored );
			const messages = conversation.messages.map( restoreMessage );

			// Cache for future access
			conversationCache.set( currentStorageKey, messages );

			return [ ...messages ];
		}
	} catch ( error ) {
		logger(
			'Failed to load conversation from sessionStorage for key %s: %O',
			currentStorageKey,
			error
		);
	}

	return [];
}

/**
 * Clear conversation for a session
 * @param sessionId              - The session ID to clear
 * @param conversationStorageKey - Optional custom storage key, defaults to sessionId
 */
export async function clearConversation(
	sessionId: string,
	conversationStorageKey?: string
): Promise< void > {
	// Determine effective storage key
	const currentStorageKey = conversationStorageKey || sessionId;

	conversationCache.delete( currentStorageKey );

	// @ts-ignore
	if ( typeof sessionStorage === 'undefined' ) {
		// Handle case where sessionStorage is not available
		return;
	}

	try {
		// @ts-ignore
		sessionStorage.removeItem( `${ STORAGE_KEY }_${ currentStorageKey }` );
	} catch ( error ) {
		logger(
			'Failed to clear conversation from sessionStorage for key %s: %O',
			currentStorageKey,
			error
		);
	}
}

/**
 * Clear all stored conversations
 */
export async function clearAllConversations(): Promise< void > {
	conversationCache.clear();

	// @ts-ignore
	if ( typeof sessionStorage === 'undefined' ) {
		// Handle case where sessionStorage is not available
		return;
	}

	try {
		// Remove all agenttic conversation keys from sessionStorage
		const keysToRemove: string[] = [];
		// @ts-ignore
		for ( let i = 0; i < sessionStorage.length; i++ ) {
			// @ts-ignore
			const key = sessionStorage.key( i );
			if ( key && key.startsWith( STORAGE_KEY ) ) {
				keysToRemove.push( key );
			}
		}

		for ( const key of keysToRemove ) {
			// @ts-ignore
			sessionStorage.removeItem( key );
		}
	} catch ( error ) {
		logger(
			'Failed to clear all conversations from sessionStorage: %O',
			error
		);
	}
}

/**
 * Get list of stored conversation session IDs
 */
export async function getStoredSessionIds(): Promise< string[] > {
	const sessionIds: string[] = [];

	// From cache
	sessionIds.push( ...conversationCache.keys() );

	// From sessionStorage
	// @ts-ignore
	if ( typeof sessionStorage === 'undefined' ) {
		// Handle case where sessionStorage is not available
		return sessionIds;
	}

	try {
		// @ts-ignore
		for ( let i = 0; i < sessionStorage.length; i++ ) {
			// @ts-ignore
			const key = sessionStorage.key( i );
			if ( key && key.startsWith( STORAGE_KEY ) ) {
				const sessionId = key.replace( `${ STORAGE_KEY }_`, '' );
				if ( ! sessionIds.includes( sessionId ) ) {
					sessionIds.push( sessionId );
				}
			}
		}
	} catch ( error ) {
		logger( 'Failed to enumerate sessionStorage keys: %O', error );
	}

	return sessionIds;
}
