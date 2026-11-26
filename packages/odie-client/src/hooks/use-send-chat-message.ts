import { useCallback, useState } from '@wordpress/element';
import { useOdieAssistantContext } from '../context';
import { useSendOdieMessage } from '../data';
import { useCreateZendeskConversation } from './use-create-zendesk-conversation';
import { useIsWaitingForFirstMessage } from './use-is-pending-direct-chat';
import { useSendZendeskMessage } from './use-send-zendesk-message';
import type { Message } from '../types';

/**
 * This is the gate that manages which message provider to use.
 */
export const useSendChatMessage = () => {
	const { addMessage, chat } = useOdieAssistantContext();
	const isWaitingForFirstMessage = useIsWaitingForFirstMessage();
	const createZendeskConversation = useCreateZendeskConversation();

	const [ abortController, setAbortController ] = useState< AbortController >(
		() => new AbortController()
	);
	const { mutateAsync: sendOdieMessage } = useSendOdieMessage( abortController.signal );
	const { mutateAsync: sendZendeskMessage } = useSendZendeskMessage( abortController.signal );

	const sendMessage = useCallback(
		async ( message: Message ) => {
			const controller = new AbortController();
			setAbortController( controller );

			// A chat with a person that waited for the first message starts with it.
			// If it can't start, the chat keeps waiting, so the next message tries again.
			if ( isWaitingForFirstMessage ) {
				return createZendeskConversation( { createdFrom: 'direct_url', firstMessage: message } );
			}

			// Payload messages should not be immediately added to chats
			if ( ! message.payload ) {
				addMessage( message );
			}

			if ( chat.provider === 'zendesk' ) {
				return sendZendeskMessage( message );
			}
			return sendOdieMessage( message );
		},
		[
			sendOdieMessage,
			sendZendeskMessage,
			addMessage,
			chat?.provider,
			isWaitingForFirstMessage,
			createZendeskConversation,
		]
	);

	return { sendMessage, abort: abortController.abort.bind( abortController ) };
};
