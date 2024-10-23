import { useUpdateZendeskUserFields } from '@automattic/zendesk-client';
import Smooch from 'smooch';
import { useOdieAssistantContext } from '../context';

export const useCreateZendeskConversation = (): ( () => Promise< void > ) => {
	const { setSupportProvider, selectedSiteId, addMessage, setChat, setChatStatus, chat } =
		useOdieAssistantContext();
	const { isPending: isSubmittingZendeskUserFields, mutateAsync: submitUserFields } =
		useUpdateZendeskUserFields();
	const chatId = Number( chat.chat_id ) || 0;

	const createConversation = async () => {
		if ( ! chatId || isSubmittingZendeskUserFields ) {
			return;
		}

		addMessage( {
			content: "We're connecting you to our support team.",
			role: 'bot',
			type: 'message',
		} );

		setChatStatus( 'sending' );

		submitUserFields( {
			messaging_initial_message: '',
			messaging_site_id: selectedSiteId || null,
			messaging_ai_chat_id: chatId,
		} ).then( () => {
			Smooch.createConversation( { metadata: { odieChatId: chatId } } ).then( ( conversation ) => {
				setSupportProvider( 'zendesk' );
				setChatStatus( 'loaded' );
				setChat( ( prevChat ) => {
					return {
						...prevChat,
						conversationId: conversation.id,
					};
				} );
			} );
		} );
	};

	return createConversation;
};
