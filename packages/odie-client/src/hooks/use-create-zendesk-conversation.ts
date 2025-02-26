import { HelpCenterSelect } from '@automattic/data-stores';
import { HELP_CENTER_STORE } from '@automattic/help-center/src/stores';
import { useUpdateZendeskUserFields } from '@automattic/zendesk-client';
import { useSelect } from '@wordpress/data';
import Smooch from 'smooch';
import { ODIE_TRANSFER_MESSAGE } from '../constants';
import { useOdieAssistantContext } from '../context';
import { useManageSupportInteraction } from '../data';
import { setHelpCenterZendeskConversationStarted } from '../utils';

export const useCreateZendeskConversation = (): ( ( {
	avoidTransfer,
	interactionId,
	createdFrom,
}: {
	avoidTransfer?: boolean;
	interactionId?: string;
	createdFrom?: string;
} ) => Promise< void > ) => {
	const {
		selectedSiteId,
		selectedSiteURL,
		userFieldMessage,
		setChat,
		setWaitAnswerToFirstMessageFromHumanSupport,
		chat,
		trackEvent,
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

	const createConversation = async ( {
		avoidTransfer = false,
		interactionId = '',
		createdFrom = '',
	}: {
		avoidTransfer?: boolean;
		interactionId?: string;
		createdFrom?: string;
	} ) => {
		const currentInteractionID = interactionId || currentSupportInteraction!.uuid;
		if ( isSubmittingZendeskUserFields || chat.conversationId ) {
			return;
		}

		if ( ! avoidTransfer ) {
			setChat( ( prevChat ) => ( {
				...prevChat,
				messages: [ ...prevChat.messages, ...ODIE_TRANSFER_MESSAGE ],
				status: 'transfer',
			} ) );
		}

		await submitUserFields( {
			messaging_initial_message: userFieldMessage || undefined,
			messaging_site_id: selectedSiteId || null,
			messaging_ai_chat_id: chatId || undefined,
			messaging_url: selectedSiteURL || null,
		} );

		const conversation = await Smooch.createConversation( {
			metadata: {
				createdAt: Date.now(),
				supportInteractionId: currentInteractionID,
				...( chatId ? { odieChatId: chatId } : {} ),
			},
		} );
		setHelpCenterZendeskConversationStarted();

		trackEvent( 'new_zendesk_conversation', {
			support_interaction: currentInteractionID,
			created_from: createdFrom,
			messaging_site_id: selectedSiteId || null,
			messaging_url: selectedSiteURL || null,
		} );

		setWaitAnswerToFirstMessageFromHumanSupport( true );
		addEventToInteraction( {
			interactionId: currentInteractionID,
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
