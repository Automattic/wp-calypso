import { HelpCenterSelect } from '@automattic/data-stores';
import { HELP_CENTER_STORE } from '@automattic/help-center/src/stores';
import { useUpdateZendeskUserFields } from '@automattic/zendesk-client';
import { useSelect } from '@wordpress/data';
import Smooch from 'smooch';
import { ODIE_TRANSFER_MESSAGE } from '../constants';
import { useOdieAssistantContext } from '../context';
import { useManageSupportInteraction } from '../data';
import { setHelpCenterZendeskConversationStarted } from '../utils';

export const useCreateZendeskConversation = (): ( () => Promise< void > ) => {
	const {
		selectedSiteId,
		setChat,
		setWaitAnswerToFirstMessageFromHumanSupport,
		chat,
		shouldUseHelpCenterExperience,
	} = useOdieAssistantContext();
	const { currentSupportInteraction } = useSelect( ( select ) => {
		const store = select( HELP_CENTER_STORE ) as HelpCenterSelect;
		return {
			currentSupportInteraction: store.getCurrentSupportInteraction(),
		};
	}, [] );
	const { isPending: isSubmittingZendeskUserFields, mutateAsync: submitUserFields } =
		useUpdateZendeskUserFields();
	const { addEventToInteraction } = useManageSupportInteraction();
	const chatId = chat.odieId;
	const createConversation = async () => {
		if ( ! chatId || isSubmittingZendeskUserFields || chat.conversationId ) {
			return;
		}

		setChat( ( prevChat ) => ( {
			...prevChat,
			messages: [ ...prevChat.messages, ODIE_TRANSFER_MESSAGE( shouldUseHelpCenterExperience ) ],
			status: 'transfer',
		} ) );

		await submitUserFields( {
			messaging_initial_message: '',
			messaging_site_id: selectedSiteId || null,
			messaging_ai_chat_id: chatId,
		} );

		const conversation = await Smooch.createConversation( {
			metadata: {
				odieChatId: chatId,
				createdAt: Date.now(),
				supportInteractionId: currentSupportInteraction!.uuid,
			},
		} );
		setHelpCenterZendeskConversationStarted();
		setWaitAnswerToFirstMessageFromHumanSupport( true );
		addEventToInteraction( {
			interactionId: currentSupportInteraction!.uuid,
			eventData: { event_source: 'zendesk', event_external_id: conversation.id },
		} );

		setChat( ( prevChat ) => ( {
			...prevChat,
			conversationId: conversation.id,
			provider: 'zendesk',
		} ) );
	};

	return createConversation;
};
