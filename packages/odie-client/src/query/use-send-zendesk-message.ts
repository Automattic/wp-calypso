import { useCallback } from '@wordpress/element';
import Smooch from 'smooch';
import { useOdieAssistantContext } from '../context';
import { useCreateZendeskConversation } from './use-create-zendesk-conversation';
import type { Message } from '../types/';

/**
 * Send a message to the Zendesk conversation.
 */
export const useSendZendeskMessage = () => {
	const { setChatStatus, selectedConversationId, chat } = useOdieAssistantContext();
	const conversationId = chat.conversationId || selectedConversationId;
	const newConversation = useCreateZendeskConversation();

	return useCallback(
		async ( message: Message ) => {
			setChatStatus( 'loading' );

			if ( ! conversationId ) {
				// Start a new conversation if it doesn't exist
				await newConversation();
				setChatStatus( 'loaded' );
				return;
			}

			await Smooch.sendMessage( { type: 'text', text: message.content }, conversationId! );
			setChatStatus( 'loaded' );
		},
		[ newConversation, setChatStatus, conversationId ]
	);
};
