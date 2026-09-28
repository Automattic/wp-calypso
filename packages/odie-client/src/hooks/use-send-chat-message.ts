import { useCallback, useState } from '@wordpress/element';
import { useOdieAssistantContext } from '../context';
import { useSendOdieMessage } from '../data';
import { useSendZendeskMessage } from './use-send-zendesk-message';
import type { Message } from '../types';

/**
 * This is the gate that manages which message provider to use.
 */
export const useSendChatMessage = () => {
	const { addMessage, chat } = useOdieAssistantContext();

	const [ abortController, setAbortController ] = useState< AbortController >(
		() => new AbortController()
	);
	const { mutateAsync: sendOdieMessage } = useSendOdieMessage( abortController.signal );
	const { mutateAsync: sendZendeskMessage } = useSendZendeskMessage( abortController.signal );

	const sendMessage = useCallback(
		async ( message: Message ) => {
			const controller = new AbortController();
			setAbortController( controller );
			// Payload messages should not be immediately added to chats
			if ( ! message.payload ) {
				addMessage( message );
			}

			if ( chat.provider === 'zendesk' ) {
				return sendZendeskMessage( message );
			}
			return sendOdieMessage( message );
		},
		[ sendOdieMessage, sendZendeskMessage, addMessage, chat?.provider ]
	);

	return { sendMessage, abort: abortController.abort.bind( abortController ) };
};
