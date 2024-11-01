import { useCallback } from '@wordpress/element';
import { useOdieAssistantContext } from '../context';
import { broadcastOdieMessage } from '../data';
import { getHelpCenterZendeskConversationStartedElapsedTime } from '../utils/storage-utils';
import { useSendOdieMessage } from './use-send-odie-message';
import { useSendZendeskMessage } from './use-send-zendesk-message';
import type { Message } from '../types/';

/**
 * This is the gate that manages which message provider to use.
 */
export const useSendChatMessage = () => {
	const {
		supportProvider,
		shouldUseHelpCenterExperience,
		addMessage,
		odieClientId,
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
			broadcastOdieMessage( message, odieClientId );

			if ( shouldUseHelpCenterExperience && supportProvider === 'zendesk' ) {
				if (
					message.role === 'user' &&
					message.type === 'message' &&
					waitAnswerToFirstMessageFromHumanSupport
				) {
					//track the time it took to send the first message for the user
					const elapsedTime = getHelpCenterZendeskConversationStartedElapsedTime();
					if ( elapsedTime ) {
						trackEvent( 'first_answer_to_human_support', {
							elapsed_time: elapsedTime,
							role: message.role,
							user_id: chat?.wpcom_user_id,
						} );
					}
					setWaitAnswerToFirstMessageFromHumanSupport( false );
				}
				return sendZendeskMessage( message );
			}

			return sendOdieMessage( message );
		},
		[
			shouldUseHelpCenterExperience,
			supportProvider,
			sendOdieMessage,
			sendZendeskMessage,
			addMessage,
			odieClientId,
			waitAnswerToFirstMessageFromHumanSupport,
			setWaitAnswerToFirstMessageFromHumanSupport,
			trackEvent,
			chat?.wpcom_user_id,
		]
	);

	return sendMessage;
};
