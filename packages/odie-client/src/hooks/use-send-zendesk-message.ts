import { HelpCenterSelect } from '@automattic/data-stores';
import { HELP_CENTER_STORE } from '@automattic/help-center/src/stores';
import { useDispatch, useSelect } from '@wordpress/data';
import Smooch from 'smooch';
import { useOdieAssistantContext } from '../context';
import { getConversationIdFromInteraction } from '../utils';
import { useCreateZendeskConversation } from './use-create-zendesk-conversation';
import type { Message } from '../types';

/**
 * Send a message to the Zendesk conversation.
 */
export const useSendZendeskMessage = () => {
	const { currentConversationId, connectionStatus, offlineQueue } = useSelect( ( select ) => {
		const store = select( HELP_CENTER_STORE ) as HelpCenterSelect;
		const currentSupportInteraction = store.getCurrentSupportInteraction();
		const connectionStatus = store.getZendeskConnectionStatus();
		const offlineQueue = store.getOfflineQueue();

		return {
			currentConversationId: getConversationIdFromInteraction( currentSupportInteraction ),
			connectionStatus,
			offlineQueue,
		};
	}, [] );

	const { setOfflineQueue } = useDispatch( HELP_CENTER_STORE );
	const { setChatStatus, chat } = useOdieAssistantContext();
	const newConversation = useCreateZendeskConversation();

	return async ( message: Message, queueWhenOffline = true ) => {
		if ( connectionStatus !== 'connected' && queueWhenOffline ) {
			return setOfflineQueue( [ ...offlineQueue, message ] );
		}

		setChatStatus( 'sending' );
		const conversationId = currentConversationId || chat.conversationId;

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
