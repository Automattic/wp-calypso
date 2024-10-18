import Smooch from 'smooch';
import { useOdieAssistantContext } from '../context';
import { useGetOdieStorage } from '../data';
import { zendeskMessageConverter } from './zendesk-message-converter';
import type { ZendeskMessage } from '../types/';

/**
 * Listens for messages from Zendesk and converts them to Odie messages.
 */
export const useZendeskMessageListener = () => {
	const chatId = useGetOdieStorage( 'chat_id' );
	const { setChat, isChatLoaded } = useOdieAssistantContext();

	if ( ! chatId || ! isChatLoaded ) {
		return;
	}

	// Smooch types are not up to date
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	Smooch.on( 'message:received', ( message: any, data ) => {
		const zendeskMessage = message as ZendeskMessage;

		if ( Number( zendeskMessage.metadata[ 'odieChatId' ] ) === Number( chatId ) ) {
			const convertedMessage = zendeskMessageConverter( zendeskMessage );
			setChat( ( prevChat ) => {
				return {
					...prevChat,
					conversationId: data.conversation.id,
					messages: [ ...prevChat.messages, convertedMessage ],
				};
			} );
			Smooch.markAllAsRead( data.conversation.id );
		}
	} );
};
