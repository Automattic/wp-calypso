/**
 * Conversation Cache Utilities
 * Manages localStorage caching for conversations and messages
 */

import { type Message, type ServerConversationListItem } from '@automattic/agenttic-client';

// Cache keys
const CONVERSATION_LIST_CACHE_KEY = 'agents-manager-conversation-list-cache';
const LAST_CONVERSATION_CACHE_KEY = 'agents-manager-last-conversation';

interface CachedConversationList {
	botId: string;
	conversations: ServerConversationListItem[];
}

interface CachedConversation {
	botId: string;
	sessionId: string;
	messages: Message[];
}

/**
 * Safely interact with localStorage
 */
const safeLocalStorage = {
	getItem: ( key: string ): string | null => {
		try {
			return localStorage.getItem( key );
		} catch {
			return null;
		}
	},
	setItem: ( key: string, value: string ): void => {
		try {
			localStorage.setItem( key, value );
		} catch {
			// Silently fail if localStorage is not available
		}
	},
	removeItem: ( key: string ): void => {
		try {
			localStorage.removeItem( key );
		} catch {
			// Silently fail
		}
	},
};

/**
 * Conversation List Cache
 */
export const conversationListCache = {
	get: ( botId: string ): ServerConversationListItem[] | null => {
		const cached = safeLocalStorage.getItem( CONVERSATION_LIST_CACHE_KEY );
		if ( ! cached ) {
			return null;
		}

		try {
			const parsed: CachedConversationList = JSON.parse( cached );
			if ( parsed.botId === botId ) {
				return parsed.conversations;
			}
			return null;
		} catch {
			return null;
		}
	},

	set: ( botId: string, conversations: ServerConversationListItem[] ): void => {
		const data: CachedConversationList = {
			botId,
			conversations,
		};
		safeLocalStorage.setItem( CONVERSATION_LIST_CACHE_KEY, JSON.stringify( data ) );
	},

	clear: (): void => {
		safeLocalStorage.removeItem( CONVERSATION_LIST_CACHE_KEY );
	},
};

/**
 * Last Conversation Cache
 */
export const lastConversationCache = {
	get: (
		botId: string
	): {
		sessionId: string;
		messages: Message[];
	} | null => {
		const cached = safeLocalStorage.getItem( LAST_CONVERSATION_CACHE_KEY );
		if ( ! cached ) {
			return null;
		}

		try {
			const parsed: CachedConversation = JSON.parse( cached );
			if ( parsed.botId === botId && Array.isArray( parsed.messages ) ) {
				return {
					sessionId: parsed.sessionId,
					messages: parsed.messages,
				};
			}
			return null;
		} catch {
			return null;
		}
	},

	set: ( botId: string, sessionId: string, messages: Message[] ): void => {
		// Validate messages
		if ( ! Array.isArray( messages ) || ! messages.length ) {
			return;
		}

		// Filter out invalid messages (must have role and parts)
		const validMessages = messages.filter(
			( msg ) => msg && typeof msg.role === 'string' && Array.isArray( msg.parts )
		);

		if ( ! validMessages.length ) {
			return;
		}

		const data: CachedConversation = {
			botId,
			sessionId,
			messages: validMessages,
		};
		safeLocalStorage.setItem( LAST_CONVERSATION_CACHE_KEY, JSON.stringify( data ) );
	},

	clear: (): void => {
		safeLocalStorage.removeItem( LAST_CONVERSATION_CACHE_KEY );
	},
};
