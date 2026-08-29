import { generateMessageId } from '../client/utils/core';
import { logger } from '../client/utils/logger';
import { DEFAULT_API_BASE_URL, loadChatFromServer, type OdieServiceConfig } from './odieService';
import type { PaginationMeta } from './serverTypes';
import type {
	AuthProvider,
	ContentType,
	DataPart,
	FilePart,
	Message,
	TextPart,
} from '../client/types/index';

const STORAGE_KEY = 'a8c_agenttic_conversation_history';

/**
 * Configuration for conversation storage
 */
export interface ConversationStorageConfig {
	odieBotId?: string; // Odie bot ID for server-based storage (e.g., 'wpcom-agent-wp_orchestrator'). When set, enables server storage.
	authProvider?: AuthProvider;
}

/**
 * Result from loading conversation with pagination info
 */
export interface ConversationLoadResult {
	messages: Message[];
	pagination?: PaginationMeta;
}

/**
 * Delivery/run status for reconciliation across page loads. See
 * {@link getUnresolvedMessages}.
 *
 * - `pending`  — user message queued locally, outbound request not yet
 *                confirmed by the server.
 * - `sent`     — reserved for consumers; this package does not write it.
 * - `streaming` — reserved for consumers; this package does not write it.
 * - `complete` — agent turn finished normally.
 * - `failed`   — outbound request rejected or in-flight turn known-abandoned.
 *
 * A stored message with no `deliveryStatus` is treated as `complete` for
 * backwards compatibility with existing stored conversations.
 */
export type DeliveryStatus = 'pending' | 'sent' | 'streaming' | 'complete' | 'failed';

/**
 * Simplified stored message format for efficient serialization
 */
interface StoredMessage {
	role: 'user' | 'agent';
	content: string;
	contentType?: ContentType;
	timestamp: number;
	archived?: boolean;
	deliveryStatus?: DeliveryStatus;
	files?: Array< {
		name: string;
		mimeType?: string;
		uri?: string;
	} >;
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
	/**
	 * Agent metadata data part (flags/sources), e.g. forward_to_human_support.
	 * Stored separately from tool calls so it survives sessionStorage round-trip.
	 */
	agentMessageData?: {
		flags?: Record< string, unknown >;
		sources?: unknown;
	};
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
	const textPartsWithMeta = message.parts.filter(
		( part ): part is TextPart => part.type === 'text'
	);

	const textParts = textPartsWithMeta.map( ( part ) => part.text ).join( '\n' );

	const contentType = textPartsWithMeta.some( ( part ) => part.metadata?.contentType === 'context' )
		? 'context'
		: undefined;

	// Extract tool calls
	const toolCalls = message.parts
		.filter(
			( part ): part is DataPart =>
				part.type === 'data' && 'toolCallId' in part.data && 'arguments' in part.data
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
				part.type === 'data' && 'toolCallId' in part.data && 'result' in part.data
		)
		.map( ( part ) => ( {
			toolCallId: part.data.toolCallId as string,
			result: part.data.result,
			error: part.data.error as string | undefined,
		} ) );

	// Extract file parts (images, etc.)
	const files = message.parts
		.filter( ( part ): part is FilePart => part.type === 'file' )
		.map( ( part ) => ( {
			name: part.file.name,
			mimeType: part.file.mimeType,
			uri: part.file.uri,
		} ) );

	// Preserve agent UI data parts (forward_to_human_support, sources) — not tool payloads
	let agentMessageData: StoredMessage[ 'agentMessageData' ];
	for ( const part of message.parts ) {
		if ( part.type !== 'data' || ! part.data || typeof part.data !== 'object' ) {
			continue;
		}
		if ( 'toolCallId' in part.data ) {
			continue;
		}
		const data = part.data as Record< string, unknown >;
		const flags = data.flags;
		if (
			flags &&
			typeof flags === 'object' &&
			flags !== null &&
			'forward_to_human_support' in flags
		) {
			agentMessageData = {
				flags: flags as Record< string, unknown >,
				...( 'sources' in data && { sources: data.sources } ),
			};
			break;
		}
	}

	// Determine the role - if this message contains tool interactions, store as "agent"
	// regardless of the original message role
	const hasToolInteractions = toolCalls.length > 0 || toolResults.length > 0;
	const storageRole = hasToolInteractions ? 'agent' : message.role;

	// Extract timestamp from message metadata or use current time as fallback
	const timestamp = ( message.metadata?.timestamp as number ) ?? Date.now();

	// Extract archived flag from message metadata
	const archived = ( message.metadata?.archived as boolean ) ?? undefined;

	// Extract deliveryStatus if present. Consumers set this via
	// `message.metadata.deliveryStatus` when they know the wire state
	// (queued / server-confirmed / streaming / complete / failed).
	const rawStatus = message.metadata?.deliveryStatus;
	const deliveryStatus: DeliveryStatus | undefined =
		rawStatus === 'pending' ||
		rawStatus === 'sent' ||
		rawStatus === 'streaming' ||
		rawStatus === 'complete' ||
		rawStatus === 'failed'
			? rawStatus
			: undefined;

	return {
		role: storageRole,
		content: textParts || '(No text content)',
		timestamp,
		...( archived !== undefined && { archived } ),
		...( contentType && { contentType } ),
		...( deliveryStatus && { deliveryStatus } ),
		...( files.length > 0 && { files } ),
		...( toolCalls.length > 0 && { toolCalls } ),
		...( toolResults.length > 0 && { toolResults } ),
		...( agentMessageData && { agentMessageData } ),
	};
}

/**
 * Convert stored message back to Message format
 * @param stored - The StoredMessage to restore
 */
function restoreMessage( stored: StoredMessage ): Message {
	const parts: Message[ 'parts' ] = [];

	// Add text part with content type in metadata
	if ( stored.content && stored.content !== '(No text content)' ) {
		parts.push( {
			type: 'text',
			text: stored.content,
			...( stored.contentType && {
				metadata: {
					contentType: stored.contentType,
				},
			} ),
		} );
	}

	// Add file parts (images, etc.)
	if ( stored.files ) {
		for ( const file of stored.files ) {
			parts.push( {
				type: 'file',
				file: {
					name: file.name,
					mimeType: file.mimeType,
					uri: file.uri,
				},
			} );
		}
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

	// Restore agent metadata data part (e.g. forward_to_human_support)
	if ( stored.agentMessageData ) {
		const data: Record< string, unknown > = {};
		if ( stored.agentMessageData.flags !== undefined ) {
			data.flags = stored.agentMessageData.flags;
		}
		if ( 'sources' in stored.agentMessageData ) {
			data.sources = stored.agentMessageData.sources ?? null;
		}
		if ( Object.keys( data ).length > 0 ) {
			parts.push( { type: 'data', data } );
		}
	}

	return {
		role: stored.role,
		kind: 'message',
		parts,
		messageId: generateMessageId(),
		metadata: {
			timestamp: stored.timestamp,
			// only store archived if it was already present.
			...( stored.archived !== undefined && {
				archived: stored.archived,
			} ),
			...( stored.deliveryStatus && {
				deliveryStatus: stored.deliveryStatus,
			} ),
		},
	};
}

/**
 * Return messages that were in-flight when the conversation was last
 * persisted. These are the candidates for reconciliation on chat panel boot
 * — a matching server-side session may still be running, may have completed
 * without the client seeing it, or may never have existed. Callers decide
 * which of those applies and how to surface the outcome.
 *
 * Uses `Message.metadata.deliveryStatus` written by {@link restoreMessage}.
 * @param messages - The restored conversation messages.
 */
export function getUnresolvedMessages( messages: Message[] ): Message[] {
	return messages.filter( ( m ) => {
		const status = m.metadata?.deliveryStatus;
		return status === 'pending' || status === 'streaming';
	} );
}

/**
 * Joined text parts — messageId is regenerated on restore, so text matches.
 * @param message - The message whose text parts to join.
 */
export function messageTextContent( message: Message ): string {
	return message.parts
		.filter( ( part ): part is TextPart => part.type === 'text' )
		.map( ( part ) => part.text )
		.join( '\n' );
}

/**
 * Count user turns by text so duplicate prompts are distinct occurrences.
 * @param messages - The messages to count user turns in.
 */
function userTextCounts( messages: Message[] ): Map< string, number > {
	const counts = new Map< string, number >();
	for ( const message of messages ) {
		if ( message.role !== 'user' ) {
			continue;
		}
		const text = messageTextContent( message );
		counts.set( text, ( counts.get( text ) ?? 0 ) + 1 );
	}
	return counts;
}

function markFailed( message: Message ): Message {
	return {
		...message,
		metadata: {
			...( message.metadata || {} ),
			deliveryStatus: 'failed' as DeliveryStatus,
		},
	};
}

/**
 * Reconcile local conversation against server when unresolved markers exist.
 *
 * Server list wins for known turns. Local unresolved user turns that exceed
 * the server's per-text count (later duplicates first) are appended as
 * `failed`. Affirmative empty/null fetch marks all local unresolved as
 * `failed`. A thrown fetch leaves them pending so a later retry can
 * reconcile instead of prompting a duplicate send.
 * @param messages    - Locally-loaded messages.
 * @param fetchServer - Server loader; null when no matching session exists.
 */
export async function reconcileWithServer(
	messages: Message[],
	fetchServer: () => Promise< Message[] | null >
): Promise< Message[] > {
	const unresolved = getUnresolvedMessages( messages );
	if ( unresolved.length === 0 ) {
		return messages;
	}

	let serverMessages: Message[] | null = null;
	try {
		serverMessages = await fetchServer();
	} catch {
		// Offline / 500: the server may still have the turn. Leave pending
		// so the next successful reconcile can recover instead of retrying.
		return messages;
	}

	if ( serverMessages && serverMessages.length > 0 ) {
		const extras = new Map< string, number >();
		const serverCounts = userTextCounts( serverMessages );
		for ( const [ text, localCount ] of userTextCounts( messages ) ) {
			extras.set( text, Math.max( 0, localCount - ( serverCounts.get( text ) ?? 0 ) ) );
		}

		const orphanedFailed: Message[] = [];
		for ( let i = unresolved.length - 1; i >= 0; i-- ) {
			const message = unresolved[ i ]!;
			const text = messageTextContent( message );
			const extra = extras.get( text ) ?? 0;
			if ( extra > 0 ) {
				extras.set( text, extra - 1 );
				orphanedFailed.unshift( markFailed( message ) );
			}
		}

		if ( orphanedFailed.length === 0 ) {
			return serverMessages;
		}
		return [ ...serverMessages, ...orphanedFailed ];
	}

	return messages.map( ( m ) => {
		const status = m.metadata?.deliveryStatus;
		if ( status === 'pending' || status === 'streaming' ) {
			return markFailed( m );
		}
		return m;
	} );
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

		sessionStorage.setItem( `${ STORAGE_KEY }_${ currentStorageKey }`, JSON.stringify( stored ) );
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
 * @param config                 - Optional storage configuration for server-based loading
 */
export async function loadConversation(
	sessionId: string,
	conversationStorageKey?: string,
	config?: ConversationStorageConfig
): Promise< ConversationLoadResult > {
	// Branch: Server storage mode (enabled when odieBotId is provided)
	if ( config?.odieBotId ) {
		return loadConversationFromServer( sessionId, config );
	}

	// Branch: Local sessionStorage mode (default)
	return loadConversationFromSessionStorage( sessionId, conversationStorageKey );
}

/**
 * Load conversation from server
 * @param sessionId - The session/chat ID to load
 * @param config    - Server storage configuration
 */
async function loadConversationFromServer(
	sessionId: string,
	config: ConversationStorageConfig
): Promise< ConversationLoadResult > {
	const { odieBotId, authProvider } = config;

	if ( ! odieBotId ) {
		throw new Error( 'odieBotId is required for server storage' );
	}

	// Always use WordPress.com public API for Odie conversations
	const apiBaseUrl = DEFAULT_API_BASE_URL;

	try {
		const serviceConfig: OdieServiceConfig = {
			botId: odieBotId,
			apiBaseUrl,
			authProvider,
		};

		// Load first page of messages from server
		const result = await loadChatFromServer( sessionId, serviceConfig, 1, 50 );

		logger(
			'Loaded conversation from server: %s (%d messages, page %d/%d)',
			sessionId,
			result.messages.length,
			result.pagination.currentPage,
			result.pagination.totalPages
		);

		return {
			messages: result.messages,
			pagination: result.pagination,
		};
	} catch ( error ) {
		logger( 'Failed to load conversation from server: %O', error );
		throw error;
	}
}

/**
 * Load conversation from sessionStorage (default behavior)
 * @param sessionId              - The session ID to load messages for
 * @param conversationStorageKey - Optional custom storage key, defaults to sessionId
 */
async function loadConversationFromSessionStorage(
	sessionId: string,
	conversationStorageKey?: string
): Promise< ConversationLoadResult > {
	// Determine effective storage key
	const currentStorageKey = conversationStorageKey || sessionId;

	// Check in-memory cache first
	if ( conversationCache.has( currentStorageKey ) ) {
		return {
			messages: [ ...conversationCache.get( currentStorageKey )! ],
		};
	}

	// Fallback to sessionStorage
	if ( typeof sessionStorage === 'undefined' ) {
		// Handle case where sessionStorage is not available
		return { messages: [] };
	}

	try {
		const stored = sessionStorage.getItem( `${ STORAGE_KEY }_${ currentStorageKey }` );
		if ( stored ) {
			const conversation: StoredConversation = JSON.parse( stored );
			const messages = conversation.messages.map( restoreMessage );

			// Cache for future access
			conversationCache.set( currentStorageKey, messages );

			return { messages: [ ...messages ] };
		}
	} catch ( error ) {
		logger(
			'Failed to load conversation from sessionStorage for key %s: %O',
			currentStorageKey,
			error
		);
	}

	return { messages: [] };
}

/**
 * Load more messages from server (pagination support)
 * Only works with server storage mode
 *
 * Note: The caller should check pagination.hasMore from the previous load
 * before calling this function to avoid unnecessary API calls.
 * @param sessionId - The session/chat ID to load
 * @param page      - Page number to load (should be validated by caller against pagination data)
 * @param config    - Server storage configuration
 * @example
 * const { messages, pagination } = await loadConversation(sessionId, undefined, config);
 * if (pagination?.hasMore) {
 *   const moreMessages = await loadMoreMessages(sessionId, pagination.currentPage + 1, config);
 * }
 */
export async function loadMoreMessages(
	sessionId: string,
	page: number,
	config: ConversationStorageConfig
): Promise< ConversationLoadResult > {
	if ( ! config?.odieBotId ) {
		throw new Error(
			'loadMoreMessages only works with server storage enabled (odieBotId required)'
		);
	}

	const { odieBotId, authProvider } = config;

	// Always use WordPress.com public API for Odie conversations
	const apiBaseUrl = DEFAULT_API_BASE_URL;

	try {
		const serviceConfig: OdieServiceConfig = {
			botId: odieBotId,
			apiBaseUrl,
			authProvider,
		};

		// Load specific page from server
		const result = await loadChatFromServer( sessionId, serviceConfig, page, 50 );

		logger(
			'Loaded more messages from server: %s (page %d, %d messages)',
			sessionId,
			page,
			result.messages.length
		);

		return {
			messages: result.messages,
			pagination: result.pagination,
		};
	} catch ( error ) {
		logger( 'Failed to load more messages from server: %O', error );
		throw error;
	}
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

	if ( typeof sessionStorage === 'undefined' ) {
		// Handle case where sessionStorage is not available
		return;
	}

	try {
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

	if ( typeof sessionStorage === 'undefined' ) {
		// Handle case where sessionStorage is not available
		return;
	}

	try {
		// Remove all agenttic conversation keys from sessionStorage
		const keysToRemove: string[] = [];
		for ( let i = 0; i < sessionStorage.length; i++ ) {
			const key = sessionStorage.key( i );
			if ( key && key.startsWith( STORAGE_KEY ) ) {
				keysToRemove.push( key );
			}
		}

		for ( const key of keysToRemove ) {
			sessionStorage.removeItem( key );
		}
	} catch ( error ) {
		logger( 'Failed to clear all conversations from sessionStorage: %O', error );
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
	if ( typeof sessionStorage === 'undefined' ) {
		// Handle case where sessionStorage is not available
		return sessionIds;
	}

	try {
		for ( let i = 0; i < sessionStorage.length; i++ ) {
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
