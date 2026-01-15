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
		( conversationId: string ) => {
			if ( ! conversationId ) {
				return null;
			}

			// We need to ensure that more than one message is loaded
			return Smooch.getConversationById( conversationId ).then( ( conversation ) => {
				// We need to load the conversation to get typing events. Load simply means "focus on".
				Smooch.loadConversation( conversation.id );
				Smooch.markAllAsRead( conversation.id );
				getUnreadNotifications();
				return parseResponse( conversation );
			} );
		},
		[ getUnreadNotifications ]
	);
};
