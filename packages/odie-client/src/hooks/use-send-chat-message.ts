import { useCallback } from '@wordpress/element';
import { useOdieAssistantContext } from '../context';
import { broadcastOdieMessage, useSendOdieMessage } from '../data';
import { useSendZendeskMessage } from './use-send-zendesk-message';
import type { Message } from '../types';

/**
 * This is the gate that manages which message provider to use.
 */
export const useSendChatMessage = () => {
	const { addMessage, odieBroadcastClientId, chat } = useOdieAssistantContext();

	const { mutateAsync: sendOdieMessage } = useSendOdieMessage();
	const sendZendeskMessage = useSendZendeskMessage();

	const sendMessage = useCallback(
		async ( message: Message ) => {
			// Payload messages should not be immediately added to chats
			if ( ! message.payload ) {
				// Add the user message to the chat and broadcast it to the client.
				addMessage( message );
				broadcastOdieMessage( message, odieBroadcastClientId );
			}

			if ( chat.provider === 'zendesk' ) {
				return sendZendeskMessage( message );
			}

			return sendOdieMessage( message );
		},
		[ sendOdieMessage, sendZendeskMessage, addMessage, odieBroadcastClientId, chat?.provider ]
	);

	return sendMessage;
};
