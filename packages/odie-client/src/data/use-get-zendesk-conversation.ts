import Smooch from 'smooch';

/**
 * Get the conversation for the Zendesk conversation.
 */
export const getZendeskConversation = ( {
	chatId,
	conversationId,
}: {
	chatId: number | string | null | undefined;
	conversationId?: string | null | undefined;
} ) => {
	if ( ! chatId ) {
		return null;
	}

	const conversation = Smooch.getConversations().find( ( conversation ) => {
		if ( conversationId ) {
			return conversation.id === conversationId;
		}

		return Number( conversation.metadata[ 'odieChatId' ] ) === Number( chatId );
	} );

	if ( ! conversation ) {
		return null;
	}

	const messages = conversation?.messages.map( ( message ) => {
		return {
			content: message.text,
			role: message.role,
			type: message.type === 'text' ? 'message' : message.type,
		};
	} );

	return { ...conversation, messages };
};
