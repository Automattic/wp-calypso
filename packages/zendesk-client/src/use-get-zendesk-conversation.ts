import { useCallback } from 'react';
import Smooch from 'smooch';
import { useGetUnreadConversations } from './use-get-unread-conversations';
import { zendeskMessageConverter } from './zendesk-message-converter';
import type { ZendeskMessage } from './types';

const parseResponse = ( conversation: Conversation ) => {
	let clientId;

	const messages = conversation?.messages
		.filter( ( message: ZendeskMessage ) => {
			// exclude form and formResponses messages from being rendered
			return message.type !== 'form' && message.type !== 'formResponse';
		} )
		.map( ( message: ZendeskMessage ) => {
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
export const useGetZendeskConversation = () => {
	const getUnreadNotifications = useGetUnreadConversations();

	return useCallback(
		( {
			chatId,
			conversationId,
		}: {
			chatId?: number | string | null | undefined;
			conversationId?: string | null | undefined;
		} ) => {
			if ( ! chatId && ! conversationId ) {
				return null;
			}

			const conversations = Smooch.getConversations();

			const conversation = conversations.find( ( conversation ) => {
				if ( conversationId ) {
					return conversation.id === conversationId;
				} else if ( chatId ) {
					return Number( conversation.metadata[ 'odieChatId' ] ) === Number( chatId );
				}

				throw new Error();
			} );

			if ( ! conversation ) {
				throw new Error();
			}

			// We need to ensure that more than one message is loaded
			return Smooch.getConversationById( conversation.id || conversationId! )
				.then( ( conversation ) => {
					Smooch.markAllAsRead( conversation.id );
					getUnreadNotifications();
					return parseResponse( conversation );
				} )
				.catch( () => parseResponse( conversation ) );
		},
		[ getUnreadNotifications ]
	);
};
