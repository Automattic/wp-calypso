import { getTimestamp } from './get-timestamp';
import type { Chat, OdieChat, OdieMessage, Message, LoggedOutOdieConversation } from '../types';

const MAX_ESCALATION_ATTEMPT_TIME = 3 * 24 * 60 * 60 * 1000; // three days

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
	return {
		id: odieChat.odieId?.toString() || '',
		messages: odieChat.messages.map( ( message ) => convertMessageToOdieMessage( message ) ),
		createdAt: odieChat.messages[ 0 ].ts || 0,
		metadata: {
			odieChatId: odieChat.odieId || 0,
			createdAt: odieChat.messages[ 0 ].ts || 0,
			supportInteractionId: '',
			status: 'open',
			botSlug,
			sessionId,
		},
	};
};
