import { getTimestamp } from './get-timestamp';
import type { Chat, OdieChat, OdieMessage, Message, LoggedOutOdieConversation } from '../types';

const MAX_ESCALATION_ATTEMPT_TIME = 3 * 24 * 60 * 60 * 1000; // three days

const STALE_CHAT_THRESHOLD = 24 * 60 * 60 * 1000; // 24 hours

/**
 * An Odie-only chat stops accepting replies once its last message is older than
 * STALE_CHAT_THRESHOLD. Chats handed over to Zendesk are excluded: a Happiness Engineer can
 * legitimately reply days later, and those already age out through AGE_THRESHOLD in
 * `get-open-live-interactions`.
 *
 * Odie messages loaded from the server always carry `created_at`; the ones appended locally
 * — the message the user just sent and the bot's reply to it — never do. So a last message
 * without a timestamp means the chat is active right now, however old the rest of it is.
 */
export const isStaleOdieChat = ( chat: Chat ) => {
	if ( chat?.provider !== 'odie' || chat?.status === 'loading' || ! chat?.messages?.length ) {
		return false;
	}

	const { created_at: lastMessageDate } = chat.messages[ chat.messages.length - 1 ];

	if ( ! lastMessageDate ) {
		return false;
	}

	const lastMessageTimestamp = getTimestamp( lastMessageDate ) * 1000;

	if ( ! Number.isFinite( lastMessageTimestamp ) ) {
		return false;
	}

	return Date.now() - lastMessageTimestamp >= STALE_CHAT_THRESHOLD;
};

export const hasRecentEscalationAttempt = ( chat: Chat ) => {
	if ( ! chat?.messages?.length ) {
		return false;
	}

	const threeDaysAgo = Date.now() - MAX_ESCALATION_ATTEMPT_TIME;

	for ( let i = chat.messages.length - 1; i >= 0; i-- ) {
		const message = chat.messages[ i ];

		if ( ! message.created_at ) {
			continue;
		}

		const messageTimestamp = getTimestamp( message.created_at ) * 1000;

		if ( messageTimestamp < threeDaysAgo ) {
			break;
		}

		if ( message.context?.flags?.forward_to_human_support ) {
			return true;
		}
	}

	return false;
};

function convertMessageToOdieMessage( message: Message ): OdieMessage {
	return {
		received: message.ts || 0,
		role: message.role,
		text: message.content as string,
	};
}

export const convertOdieChatToOdieConversation = (
	odieChat: OdieChat,
	sessionId: string,
	botSlug: string
): LoggedOutOdieConversation => {
	const createdAt = odieChat.messages[ 0 ]?.ts ?? 0;
	return {
		id: odieChat.odieId?.toString() || '',
		messages: odieChat.messages.map( ( message ) => convertMessageToOdieMessage( message ) ),
		createdAt,
		metadata: {
			odieChatId: odieChat.odieId || 0,
			createdAt,
			supportInteractionId: '',
			status: 'open',
			botSlug,
			sessionId,
		},
	};
};
