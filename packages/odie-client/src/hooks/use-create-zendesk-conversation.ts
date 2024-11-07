import { useUpdateZendeskUserFields } from '@automattic/zendesk-client';
import Smooch from 'smooch';
import { useOdieAssistantContext } from '../context';
import { useManageSupportInteraction } from '../data';
import { setHelpCenterZendeskConversationStarted } from '../utils';

export const useCreateZendeskConversation = (): ( () => Promise< void > ) => {
	const {
		selectedSiteId,
		addMessage,
		setChatStatus,
		setWaitAnswerToFirstMessageFromHumanSupport,
		setChatProvider,
		chat,
		shouldUseHelpCenterExperience,
	} = useOdieAssistantContext();
	const { isPending: isSubmittingZendeskUserFields, mutateAsync: submitUserFields } =
		useUpdateZendeskUserFields();
	const { addEventToInteraction } = useManageSupportInteraction();
	const chatId = chat.odieId;
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
			Smooch.createConversation( {
				metadata: {
					odieChatId: chatId,
					createdAt: Date.now(),
					supportInteractionId: chat.supportInteractionId,
				},
			} ).then( ( conversation ) => {
				setChatProvider( 'zendesk' );
				setChatStatus( 'loaded' );
				setHelpCenterZendeskConversationStarted();
				setWaitAnswerToFirstMessageFromHumanSupport( true );
				addEventToInteraction( {
					interactionId: chat.supportInteractionId as string,
					eventData: { event_source: 'zendesk', event_external_id: conversation.id },
				} );
			} );
		} );
	};

	return createConversation;
};
