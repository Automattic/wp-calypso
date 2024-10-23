import { useUpdateZendeskUserFields } from '@automattic/zendesk-client';
import Smooch from 'smooch';
import { useOdieAssistantContext } from '../context';
import { useGetOdieStorage } from '../data';

export const useZendeskConversations = () => {
	const { setSupportProvider, selectedSiteId, addMessage } = useOdieAssistantContext();
	const { isPending: isSubmittingZendeskUserFields, mutateAsync: submitUserFields } =
		useUpdateZendeskUserFields();
	const chatId = Number( useGetOdieStorage( 'chat_id' ) ) ?? undefined;

	const startNewConversation = () => {
		if ( isSubmittingZendeskUserFields ) {
			return;
		}

		addMessage( {
			content: "We're connecting you to our support team.",
			role: 'bot',
			type: 'message',
		} );

		submitUserFields( {
			messaging_initial_message: '',
			messaging_site_id: selectedSiteId || null,
			messaging_ai_chat_id: chatId,
		} ).then( () => {
			Smooch.createConversation( { metadata: { odieChatId: chatId } } ).then( () =>
				setSupportProvider( 'zendesk' )
			);
		} );
	};

	const getConversationByChatId = async (
		odieChatId: number
	): Promise< Conversation | undefined > => {
		const existingConversation = Smooch.getConversations().find( ( conversation: Conversation ) => {
			return Number( conversation.metadata[ 'odieChatId' ] ) === odieChatId;
		} );

		if ( ! existingConversation ) {
			return;
		}

		const result = await Smooch.getConversationById( existingConversation.id );

		if ( result ) {
			Smooch.markAllAsRead( result.id );
			return result;
		}
	};

	return { startNewConversation, getConversationByChatId };
};
