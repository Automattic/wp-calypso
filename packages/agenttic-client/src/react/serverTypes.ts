/**
 * Server-side conversation storage types
 * Maps to odie-assistant.php endpoints on WordPress.com
 */

import type { Message, Part, TextPart } from '../client/types/index';
import { generateMessageId } from '../client/utils/core';

/**
 * Server message format from odie-assistant API
 * Matches the structure returned by get_chat_with_messages()
 */
export interface ServerMessage {
	message_id: number;
	chat_id?: number;
	role: 'user' | 'bot' | 'system' | 'tool_call' | 'tool_result';
	content: string;
	context?: Record< string, unknown > | any[];
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
 * Conversation list item from server
 * Represents a chat with metadata and latest message preview
 */
export interface ServerConversationListItem {
	chat_id: number;
	bot_id?: string;
	wpcom_user_id?: number;
	session_id?: string;
	created_at: string; // MySQL datetime format: "2025-11-06 14:29:49"
	last_message?: {
		content: string;
		role: 'user' | 'bot' | 'system';
		created_at: string; // MySQL datetime format
	};
}

/**
 * Transform server message to client Message format
 * @param serverMessage - Server message from odie-assistant API
 */
export function serverMessageToMessage(
	serverMessage: ServerMessage
): Message {
	const parts: Part[] = [];

	// Add text content if available
	if ( serverMessage.content ) {
		const textPart: TextPart = {
			type: 'text',
			text: serverMessage.content,
		};
		parts.push( textPart );
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
 * Transform server chat response to client format
 * @param serverChat - Server chat from odie-assistant API
 */
export function serverChatToLoadResult(
	serverChat: ServerChat
): ServerLoadResult {
	// Filter out tool_call and tool_result messages before converting
	const filteredServerMessages = serverChat.messages.filter(
		( msg ) => msg.role !== 'tool_call' && msg.role !== 'tool_result'
	);

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
