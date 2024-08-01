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

export function getConversationMetadada( chatId: number ): Record< string, any > {
	return {
		[ ODIE_CHAT_KEY ]: chatId,
	};
}

export function getConversationUserFields(
	chatId: number,
	siteUrl: string | null = 'No site selected',
	sectionName: string | null = '',
	siteId: number | null = null
) {
	return {
		messaging_ai_chat_id: chatId,
		messaging_source: sectionName,
		messaging_initial_message: '',
		messaging_plan: '', // Will be filled out by backend
		messaging_url: siteUrl,
		messaging_site_id: siteId,
	};
}
