import { useCallback } from '@wordpress/element';
import Smooch from 'smooch';
import { useOdieAssistantContext } from '../context';
import { useGetOdieStorage } from '../data';
import { getZendeskConversation } from '../data/use-get-zendesk-conversation';
import { useCreateZendeskConversation } from './use-create-zendesk-conversation';
import type { Message } from '../types/';

/**
 * Send a message to the Zendesk conversation.
 */
export const useSendZendeskMessage = () => {
	const { setChatStatus } = useOdieAssistantContext();
	const chatId = useGetOdieStorage( 'chat_id' ) ?? '';
	const newConversation = useCreateZendeskConversation();

	const sendMessage = useCallback(
		async ( message: Message ) => {
			const conversation = getZendeskConversation( { chatId } );

			setChatStatus( 'sending' );

			if ( ! conversation ) {
				// Start a new conversation if it doesn't exist
				await newConversation();
				setChatStatus( 'loaded' );
				return;
			}

			await Smooch.sendMessage( { type: 'text', text: message.content }, conversation.id! );
			setChatStatus( 'loaded' );
		},
		[ newConversation, setChatStatus, chatId ]
	);

	return sendMessage;
};
