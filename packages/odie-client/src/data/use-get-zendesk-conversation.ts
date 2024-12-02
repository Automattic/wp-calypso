import Smooch from 'smooch';
import { zendeskMessageConverter } from '../utils';
import type { ZendeskMessage } from '../types';

const parseResponse = ( conversation: Conversation ) => {
	let clientId;

	const messages = conversation?.messages.map( ( message: ZendeskMessage ) => {
		if ( message.source?.id ) {
			clientId = message.source?.id;
		}
		return zendeskMessageConverter( message );
	} );

	return { ...conversation, clientId, messages };
};

/**
 * Get the conversation for the Zendesk conversation.
 */
export const getZendeskConversation = ( {
	chatId,
	conversationId,
}: {
	chatId?: number | string | null;
	conversationId?: string;
} ) => {
	if ( ! chatId && ! conversationId ) {
		return null;
	}

	const conversation = Smooch.getConversations().find( ( conversation ) => {
		if ( conversationId ) {
			return conversation.id === conversationId;
		} else if ( chatId ) {
			return Number( conversation.metadata[ 'odieChatId' ] ) === Number( chatId );
		}

		return false;
	} );

	if ( ! conversation ) {
		return null;
	}

	// We need to ensure that more than one message is loaded
	return Smooch.getConversationById( conversation.id || conversationId )
		.then( ( conversation ) => {
			Smooch.markAllAsRead( conversation.id );
			return parseResponse( conversation );
		} )
		.catch( () => parseResponse( conversation ) );
};
