import { Message as OdieMessage } from '../types/';

interface Message {
	role: 'user' | unknown;
	userId: string;
	id: string;
	type: string;
	received: number;
	text: string;
}

export const ODIE_CHAT_KEY = 'odieChatId';

export function transformMessages( originalMessages: Message[] ): OdieMessage[] {
	return originalMessages.filter( ( message ) => message.type === 'text' ).map( transformMessage );
}

export function transformMessage( originalMessage: Message ): OdieMessage {
	if ( ! originalMessage ) {
		return {
			content: '',
			role: 'user',
			type: 'placeholder',
		};
	}
	const newRole = originalMessage?.role === 'user' ? 'user' : 'agent';
	const newType = 'message';

	return {
		content: originalMessage.text,
		internal_message_id: originalMessage.id,
		message_id: parseInt( originalMessage.userId ),
		role: newRole,
		type: newType,
	};
}

export function getConversationMetadada( chatId?: number | null ): Record< string, any > {
	if ( ! chatId ) {
		return {};
	}
	return {
		[ ODIE_CHAT_KEY ]: chatId,
	};
}
