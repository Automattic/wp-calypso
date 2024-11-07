import { HelpCenterSelect } from '@automattic/data-stores';
import { HELP_CENTER_STORE } from '@automattic/help-center/src/stores';
import { useSelect } from '@wordpress/data';
import { useCallback } from '@wordpress/element';
import Smooch from 'smooch';
import { useOdieAssistantContext } from '../context';
import { useCreateZendeskConversation } from './use-create-zendesk-conversation';
import type { Message } from '../types';

/**
 * Send a message to the Zendesk conversation.
 */
export const useSendZendeskMessage = () => {
	const conversationId = useSelect( ( select ) => {
		const store = select( HELP_CENTER_STORE ) as HelpCenterSelect;
		const currentSupportInteraction = store.getCurrentSupportInteraction();

		return currentSupportInteraction?.events.find( ( event ) => event.event_source === 'zendesk' )
			?.event_external_id;
	}, [] );

	const { setChatStatus, chat } = useOdieAssistantContext();
	const newConversation = useCreateZendeskConversation();

	return useCallback(
		async ( message: Message ) => {
			setChatStatus( 'loading' );

			if ( ! conversationId || ! chat.conversationId ) {
				// Start a new conversation if it doesn't exist
				await newConversation();
				setChatStatus( 'loaded' );
				return;
			}

			await Smooch.sendMessage( { type: 'text', text: message.content }, conversationId );
			setChatStatus( 'loaded' );
		},
		[ newConversation, setChatStatus, conversationId ]
	);
};
