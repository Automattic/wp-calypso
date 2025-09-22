import { useCallback, useState } from '@wordpress/element';
import { useOdieAssistantContext } from '../context';
import { broadcastOdieMessage, useSendOdieMessage } from '../data';
import { useSendZendeskMessage } from './use-send-zendesk-message';
import type { Message } from '../types';

/**
 * This is the gate that manages which message provider to use.
 */
export const useSendChatMessage = () => {
	const { addMessage, odieBroadcastClientId, chat } = useOdieAssistantContext();

	const [ abortController, setAbortController ] = useState< AbortController >(
		new AbortController()
	);
	const { mutateAsync: sendOdieMessage } = useSendOdieMessage( abortController.signal );
	const { mutateAsync: sendZendeskMessage } = useSendZendeskMessage( abortController.signal );

	const sendMessage = useCallback(
		async ( message: Message ) => {
			const controller = new AbortController();
			setAbortController( controller );
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

	return { sendMessage, abort: abortController.abort.bind( abortController ) };
};
