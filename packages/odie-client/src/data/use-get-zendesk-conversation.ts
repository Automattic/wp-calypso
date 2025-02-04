import { useCallback } from 'react';
import Smooch from 'smooch';
import { useOdieAssistantContext } from '../context';
import { zendeskMessageConverter } from '../utils';
import { useGetUnreadConversations } from './use-get-unread-conversations';
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
export const useGetZendeskConversation = () => {
	const getUnreadNotifications = useGetUnreadConversations();
	const { trackEvent } = useOdieAssistantContext();

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

				return false;
			} );

			if ( ! conversation ) {
				// Conversation id was passed but the conversion was not found. Something went wrong.
				if ( conversationId ) {
					trackEvent( 'zendesk_conversation_not_found', {
						conversationId,
						chatId,
						conversationsCount: conversations?.length ?? null,
					} );
				}
				return null;
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
		[ getUnreadNotifications, trackEvent ]
	);
};
