import Smooch from 'smooch';
import { useOdieAssistantContext } from '../context';
import { useCurrentSupportInteraction } from '../data/use-current-support-interaction';
import { getConversationIdFromInteraction } from '../utils';
import { useCreateZendeskConversation } from './use-create-zendesk-conversation';
import type { Message } from '../types';

/**
 * Send a message to the Zendesk conversation.
 */
export const useSendZendeskMessage = () => {
	const { data: currentSupportInteraction } = useCurrentSupportInteraction();
	const currentConversationId = getConversationIdFromInteraction( currentSupportInteraction );

	const { setChatStatus, chat } = useOdieAssistantContext();
	const newConversation = useCreateZendeskConversation();

	const conversationId = currentConversationId || chat.conversationId;
	return async ( message: Message ) => {
		setChatStatus( 'sending' );

		if ( ! conversationId ) {
			// Start a new conversation if it doesn't exist
			await newConversation( { createdFrom: 'send_zendesk_message' } );
			setChatStatus( 'loaded' );
			return;
		}

		const messageToSend = {
			type: 'text',
			text: message.content as string,
			...( message.payload && { payload: message.payload } ),
			...( message.metadata && { metadata: message.metadata } ),
		};
		await Smooch.sendMessage( messageToSend, conversationId );
		setChatStatus( 'loaded' );
	};
};
