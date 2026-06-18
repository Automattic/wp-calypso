/**
 * Server-side conversation storage types
 * Maps to odie-assistant.php endpoints on WordPress.com
 */

import type {
	DataPart,
	FilePart,
	Message,
	Part,
	TextPart,
} from '../client/types/index';
import { generateMessageId } from '../client/utils/core';

/**
 * Server-side file part structure from odie-assistant API
 * Represents an attached file/image in the message context
 * Note: Only essential fields are stored (id, uri).
 * Full metadata can be fetched from media library if needed.
 */
export interface ServerFilePart {
	id?: number; // WordPress attachment ID
	uri: string;
}

/**
 * Context structure that may contain file parts, sources, and flags (e.g. forward_to_human_support)
 */
export interface ServerMessageContext {
	file_parts?: ServerFilePart[];
	sources?: unknown;
	flags?: Record< string, unknown >;
	[ key: string ]: unknown;
}

/**
 * Server message format from odie-assistant API
 * Matches the structure returned by get_chat_with_messages()
 */
export interface ServerMessage {
	message_id: number;
	chat_id?: number;
	role: 'user' | 'bot' | 'system' | 'tool_call' | 'tool_result';
	content: string;
	context?: ServerMessageContext | unknown[];
	created_at: string; // MySQL datetime format: "2025-11-06 14:29:49"
	ts?: number;
}

/**
 * Server chat/conversation format
 * Matches the structure returned by get_chat_with_messages()
 */
export interface ServerChat {
	chat_id: number;
	bot_id: string;
	wpcom_user_id?: number;
	session_id?: string;
	messages: ServerMessage[];
	metadata?: {
		total_messages: number;
		current_page: number;
		items_per_page: number;
		total_pages: number;
	};
	created_at: string;
	updated_at: string;
}

/**
 * Pagination metadata for server responses
 */
export interface PaginationMeta {
	currentPage: number;
	itemsPerPage: number;
	totalPages: number;
	totalMessages: number;
	hasMore: boolean;
}

/**
 * Result of loading messages from server
 */
export interface ServerLoadResult {
	messages: Message[];
	pagination: PaginationMeta;
	chatId: number;
	sessionId?: string;
}

/**
 * Message preview for conversation list items
 */
export interface ServerConversationListItemMessage {
	content: string;
	role: 'user' | 'bot' | 'system';
	created_at: string; // MySQL datetime format
}

/**
 * Conversation list item with metadata and message preview
 */
export interface ServerConversationListItem {
	chat_id: number;
	bot_id?: string;
	wpcom_user_id?: number;
	session_id?: string;
	created_at: string; // MySQL datetime format: "2025-11-06 14:29:49"
	last_message?: ServerConversationListItemMessage;
	first_message?: ServerConversationListItemMessage;
}

/**
 * Transform server message to client Message format
 * @param serverMessage - Server message from odie-assistant API
 */
export function serverMessageToMessage(
	serverMessage: ServerMessage
): Message {
	const parts: Part[] = [];
	const context = serverMessage.context;

	// A message the server flagged as context-only is sent to the model but
	// must not be shown in the UI (e.g. a tool turn-closing ack that would
	// otherwise duplicate a picker's caption on reload). Map it to the existing
	// `contentType: 'context'` text metadata so `getVisibleMessages` strips it —
	// no bespoke client-side filter needed.
	const isContextOnly =
		!! context &&
		! Array.isArray( context ) &&
		!! context.flags &&
		typeof context.flags === 'object' &&
		( context.flags as Record< string, unknown > ).context_only === true;

	// Add text content if available
	if ( serverMessage.content ) {
		const textPart: TextPart = {
			type: 'text',
			text: serverMessage.content,
			...( isContextOnly && {
				metadata: { contentType: 'context' },
			} ),
		};
		parts.push( textPart );
	}

	// Add file parts from context (images/attachments)
	if (
		context &&
		! Array.isArray( context ) &&
		Array.isArray( context.file_parts )
	) {
		for ( const serverFilePart of context.file_parts ) {
			if ( serverFilePart?.uri ) {
				const part: FilePart = {
					type: 'file',
					file: {
						name: 'image',
						uri: serverFilePart.uri,
					},
					// Pass attachment ID in metadata if available
					metadata: serverFilePart.id
						? { id: serverFilePart.id }
						: undefined,
				};
				parts.push( part );
			}
		}
	}

	// Preserve flags (e.g. forward_to_human_support) and sources from context as a data part.
	if ( context && ! Array.isArray( context ) ) {
		const ctx = context as ServerMessageContext;
		const hasFlags =
			ctx.flags && typeof ctx.flags === 'object' && ctx.flags !== null;
		const hasSources =
			Array.isArray( ctx.sources ) && ctx.sources.length > 0;

		if ( hasFlags || hasSources ) {
			const data: Record< string, unknown > = {};
			if ( hasFlags ) {
				data.flags = ctx.flags;
			}
			if ( hasSources ) {
				data.sources = ctx.sources;
			}
			parts.push( {
				type: 'data',
				data,
			} );
		}
	}

	// Tool calls and tool results are intentionally not included in parts
	// to hide them from the UI display

	// Map server role to client role
	// 'bot' and 'system' both map to 'agent'
	const role: 'user' | 'agent' =
		serverMessage.role === 'user' ? 'user' : 'agent';

	// Parse MySQL datetime to timestamp
	const timestamp = serverMessage.ts
		? serverMessage.ts * 1000 // Convert Unix timestamp to milliseconds
		: new Date(
				serverMessage.created_at.replace( ' ', 'T' ) + 'Z'
		  ).getTime();

	return {
		role,
		kind: 'message',
		parts,
		messageId: generateMessageId(),
		metadata: {
			timestamp,
			serverId: serverMessage.message_id,
			chatId: serverMessage.chat_id,
		},
	};
}

/**
 * Check if a message is a `wpcom__think` tool message
 * @param msg - Server message to check
 */
function isThinkToolMessage( msg: ServerMessage ): boolean {
	if ( msg.role !== 'tool_call' && msg.role !== 'tool_result' ) {
		return false;
	}

	try {
		const content = JSON.parse( msg.content );
		return content.tool_id === 'wpcom__think';
	} catch {
		return false;
	}
}

/**
 * Transform server chat response to client format
 * @param serverChat        - Server chat from odie-assistant API
 * @param allowToolMessages - When `true`, includes `tool_result` messages (except `wpcom__think`). Defaults to `false`.
 */
export function serverChatToLoadResult(
	serverChat: ServerChat,
	allowToolMessages = false
): ServerLoadResult {
	const filteredServerMessages = serverChat.messages.filter( ( msg ) => {
		// Always filter out `tool_call` messages
		if ( msg.role === 'tool_call' ) {
			return false;
		}

		// Handle `tool_result` messages
		if ( msg.role === 'tool_result' ) {
			// Only keep tool results if `allowToolMessages` is `true`
			if ( ! allowToolMessages ) {
				return false;
			}

			// Filter out `wpcom__think` tool results
			if ( isThinkToolMessage( msg ) ) {
				return false;
			}

			return true;
		}

		return true;
	} );

	const messages = filteredServerMessages.map( serverMessageToMessage );

	const pagination: PaginationMeta = {
		currentPage: serverChat.metadata?.current_page ?? 1,
		itemsPerPage: serverChat.metadata?.items_per_page ?? 10,
		totalPages: serverChat.metadata?.total_pages ?? 1,
		totalMessages: serverChat.metadata?.total_messages ?? messages.length,
		hasMore:
			( serverChat.metadata?.current_page ?? 1 ) <
			( serverChat.metadata?.total_pages ?? 1 ),
	};

	return {
		messages,
		pagination,
		chatId: serverChat.chat_id,
		sessionId: serverChat.session_id,
	};
}

/**
 * Error thrown when server conversation loading fails
 */
export class ServerConversationError extends Error {
	constructor(
		message: string,
		public readonly statusCode?: number,
		public readonly details?: unknown
	) {
		super( message );
		this.name = 'ServerConversationError';
	}
}
