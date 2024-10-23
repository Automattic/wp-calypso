import Smooch from 'smooch';

const parseResponse = ( conversation: Conversation ) => {
	const messages = conversation?.messages.map( ( message ) => {
		return {
			content: message.text,
			role: message.role,
			type: message.type === 'text' ? 'message' : message.type,
		};
	} );

	return { ...conversation, messages };
};
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

	// We need to ensure that more than one message is loaded
	return Smooch.getConversationById( conversation.id )
		.then( ( conversation ) => {
			Smooch.markAllAsRead( conversation.id );
			return parseResponse( conversation );
		} )
		.catch( () => parseResponse( conversation ) );
};
