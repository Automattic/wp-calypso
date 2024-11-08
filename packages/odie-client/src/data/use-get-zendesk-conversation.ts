import Smooch from 'smooch';
import { zendeskMessageConverter } from '../utils';
import type { ZendeskMessage } from '../types/';

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
