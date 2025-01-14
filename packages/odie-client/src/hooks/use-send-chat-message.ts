import { useCallback } from '@wordpress/element';
import { useOdieAssistantContext } from '../context';
import { broadcastOdieMessage, useSendOdieMessage } from '../data';
import { getHelpCenterZendeskConversationStartedElapsedTime } from '../utils';
import { useSendZendeskMessage } from './use-send-zendesk-message';
import type { Message } from '../types';

/**
 * This is the gate that manages which message provider to use.
 */
export const useSendChatMessage = () => {
	const {
		addMessage,
		odieBroadcastClientId,
		waitAnswerToFirstMessageFromHumanSupport,
		setWaitAnswerToFirstMessageFromHumanSupport,
		trackEvent,
		chat,
	} = useOdieAssistantContext();

	const { mutateAsync: sendOdieMessage } = useSendOdieMessage();
	const sendZendeskMessage = useSendZendeskMessage();

	const sendMessage = useCallback(
		async ( message: Message ) => {
			// Add the user message to the chat and broadcast it to the client.
			addMessage( message );
			broadcastOdieMessage( message, odieBroadcastClientId );

			if ( chat.provider === 'zendesk' ) {
				if (
					message.role === 'user' &&
					message.type === 'message' &&
					waitAnswerToFirstMessageFromHumanSupport
				) {
					//track the time it took to send the first message for the user
					const elapsedTime = getHelpCenterZendeskConversationStartedElapsedTime();
					if ( elapsedTime ) {
						trackEvent( 'first_answer_to_human_support', {
							elapsed_time_less_than_900s: elapsedTime < 900 * 1000,
							role: message.role,
							user_id: chat?.wpcomUserId,
						} );
					}
					setWaitAnswerToFirstMessageFromHumanSupport( false );
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
			waitAnswerToFirstMessageFromHumanSupport,
			setWaitAnswerToFirstMessageFromHumanSupport,
			trackEvent,
			chat?.wpcomUserId,
			chat?.provider,
		]
	);

	return sendMessage;
};
