import { useCallback, useState } from '@wordpress/element';
import { useSearchParams } from 'react-router-dom';
import { useOdieAssistantContext } from '../context';
import { useSendOdieMessage } from '../data';
import { useCreateZendeskConversation } from './use-create-zendesk-conversation';
import { START_ON_MESSAGE_PARAM, useIsWaitingForFirstMessage } from './use-is-pending-direct-chat';
import { useSendZendeskMessage } from './use-send-zendesk-message';
import type { Message } from '../types';

/**
 * This is the gate that manages which message provider to use.
 */
export const useSendChatMessage = () => {
	const { addMessage, chat } = useOdieAssistantContext();
	const isWaitingForFirstMessage = useIsWaitingForFirstMessage();
	const createZendeskConversation = useCreateZendeskConversation();
	const [ , setSearchParams ] = useSearchParams();

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
			if ( isWaitingForFirstMessage ) {
				const conversationId = await createZendeskConversation( {
					createdFrom: 'direct_url',
					firstMessage: message,
				} );
				if ( ! conversationId ) {
					// Like a failed transfer, a chat that couldn't start leaves the user with the AI.
					setSearchParams( ( params ) => {
						params.delete( START_ON_MESSAGE_PARAM );
						return params;
					} );
				}
				return;
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
			setSearchParams,
		]
	);

	return { sendMessage, abort: abortController.abort.bind( abortController ) };
};
