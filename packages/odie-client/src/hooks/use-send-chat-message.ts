import { useCallback, useState } from '@wordpress/element';
import { useOdieAssistantContext } from '../context';
import { broadcastOdieMessage, useSendOdieMessage } from '../data';
import { useSendZendeskMessage } from './use-send-zendesk-message';
import type { Message } from '../types';

/**
 * This is the gate that manages which message provider to use.
 */
export const useSendChatMessage = () => {
	const { addMessage, odieBroadcastClientId, chat, setChat } = useOdieAssistantContext();

	const [ abortController, setAbortController ] = useState< AbortController >(
		new AbortController()
	);
	const { mutateAsync: sendOdieMessage } = useSendOdieMessage( abortController.signal );
	const { mutateAsync: sendZendeskMessage } = useSendZendeskMessage( abortController.signal );

	const sendMessage = useCallback(
		async ( message: Message, resending = false ) => {
			if ( chat.provider === 'odie' ) {
				const controller = new AbortController();
				setAbortController( controller );
				// Payload messages should not be immediately added to chats
				if ( ! message.payload ) {
					// Add the user message to the chat and broadcast it to the client.
					addMessage( message );
					broadcastOdieMessage( message, odieBroadcastClientId );
				}
			} else if ( chat.provider === 'zendesk' ) {
				if ( resending ) {
					setChat( ( prevChat ) => {
						const newMessage = { ...message, status: 'sending' } as const;
						const index = prevChat.messages.findIndex(
							( m ) => m.temporary_id === message.temporary_id
						);
						const messages = [ ...prevChat.messages ];
						messages[ index ] = newMessage;
						return {
							...prevChat,
							messages,
						};
					} );
				} else {
					addMessage( message );
				}
				return sendZendeskMessage( message );
			}
			return sendOdieMessage( message );
		},
		[
			sendOdieMessage,
			sendZendeskMessage,
			addMessage,
			odieBroadcastClientId,
			chat?.provider,
			setChat,
		]
	);

	return { sendMessage, abort: abortController.abort.bind( abortController ) };
};
