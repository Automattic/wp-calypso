import { useCallback } from 'react';
import Smooch from 'smooch';
import { useGetUnreadConversations } from './use-get-unread-conversations';
import { zendeskMessageConverter } from './zendesk-message-converter';
import type { ZendeskMessage } from './types';

export const convertZendeskMessages = ( messages: ZendeskMessage[] ) =>
	messages
		// exclude form and formResponses messages from being rendered
		.filter( ( message ) => message.type !== 'form' && message.type !== 'formResponse' )
		.map( zendeskMessageConverter );

const parseResponse = ( conversation: Conversation ) => {
	const clientId = conversation?.messages.findLast(
		( message: ZendeskMessage ) => message.source?.id
	)?.source?.id;

	return { ...conversation, clientId, messages: convertZendeskMessages( conversation?.messages ) };
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
