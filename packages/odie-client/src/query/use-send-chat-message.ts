import { useCallback } from '@wordpress/element';
import { useOdieAssistantContext } from '../context';
import { broadcastOdieMessage } from '../data';
import { useSendOdieMessage } from './use-send-odie-message';
import { useSendZendeskMessage } from './use-send-zendesk-message';
import type { Message } from '../types/';

/**
 * This is the gate that manages which message provider to use.
 */
export const useSendChatMessage = () => {
	const { supportProvider, shouldUseHelpCenterExperience, addMessage, odieClientId } =
		useOdieAssistantContext();

	const { mutateAsync: sendOdieMessage } = useSendOdieMessage();
	const sendZendeskMessage = useSendZendeskMessage();

	const sendMessage = useCallback(
		async ( message: Message ) => {
			// Add the user message to the chat and broadcast it to the client.
			addMessage( message );
			broadcastOdieMessage( message, odieClientId );

			if ( shouldUseHelpCenterExperience && supportProvider === 'zendesk' ) {
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
		]
	);

	return sendMessage;
};
