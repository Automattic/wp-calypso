import { useUpdateZendeskUserFields } from '@automattic/zendesk-client';
import Smooch from 'smooch';
import { useOdieAssistantContext } from '../context';
import { setHelpCenterZendeskConversationStarted } from '../utils';

export const useCreateZendeskConversation = (): ( () => Promise< void > ) => {
	const {
		setSupportProvider,
		selectedSiteId,
		addMessage,
		setChat,
		setChatStatus,
		setWaitAnswerToFirstMessageFromHumanSupport,
		chat,
		shouldUseHelpCenterExperience,
	} = useOdieAssistantContext();
	const { isPending: isSubmittingZendeskUserFields, mutateAsync: submitUserFields } =
		useUpdateZendeskUserFields();
	const chatId = Number( chat.chat_id ) || 0;

	const createConversation = async () => {
		if ( ! chatId || isSubmittingZendeskUserFields ) {
			return;
		}

		addMessage( {
			content: shouldUseHelpCenterExperience
				? "Help's on the way!"
				: "We're connecting you to our support team.",
			role: 'bot',
			type: 'message',
			context: {
				flags: {
					hide_disclaimer_content: true,
					show_contact_support_msg: true,
				},
				site_id: null,
			},
		} );

		setChatStatus( 'sending' );

		submitUserFields( {
			messaging_initial_message: '',
			messaging_site_id: selectedSiteId || null,
			messaging_ai_chat_id: chatId,
		} ).then( () => {
			Smooch.createConversation( { metadata: { odieChatId: chatId, createdAt: Date.now() } } ).then(
				( conversation ) => {
					setSupportProvider( 'zendesk' );
					setChatStatus( 'loaded' );
					setHelpCenterZendeskConversationStarted();
					setWaitAnswerToFirstMessageFromHumanSupport( true );
					setChat( ( prevChat ) => {
						return {
							...prevChat,
							conversationId: conversation.id,
						};
					} );
				}
			);
		} );
	};

	return createConversation;
};
