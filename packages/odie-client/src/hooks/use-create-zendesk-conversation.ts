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
	section,
	createdFrom,
}: {
	avoidTransfer?: boolean;
	interactionId?: string;
	section?: string | null;
	createdFrom?: string;
} ) => Promise< void > ) => {
	const {
		selectedSiteId,
		selectedSiteURL,
		userFieldMessage,
		userFieldFlowName,
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
		section = '',
		createdFrom = '',
	}: {
		avoidTransfer?: boolean;
		interactionId?: string;
		section?: string | null;
		createdFrom?: string;
	} ) => {
		const currentInteractionID = interactionId || currentSupportInteraction!.uuid;
		if (
			isSubmittingZendeskUserFields ||
			chat.conversationId ||
			chat.status === 'transfer' ||
			chat.provider === 'zendesk'
		) {
			return;
		}

		setChat( ( prevChat ) => ( {
			...prevChat,
			messages: avoidTransfer
				? prevChat.messages
				: [ ...prevChat.messages, ...ODIE_TRANSFER_MESSAGE ],
			status: 'transfer',
		} ) );

		await submitUserFields( {
			messaging_initial_message: userFieldMessage || undefined,
			messaging_site_id: selectedSiteId || null,
			messaging_ai_chat_id: chatId || undefined,
			messaging_url: selectedSiteURL || null,
			messaging_flow: userFieldFlowName || null,
			messaging_source: section,
		} );
		setHelpCenterZendeskConversationStarted();
		const conversation = await Smooch.createConversation( {
			metadata: {
				createdAt: Date.now(),
				supportInteractionId: currentInteractionID,
				...( chatId ? { odieChatId: chatId } : {} ),
			},
		} );

		trackEvent( 'new_zendesk_conversation', {
			support_interaction: currentInteractionID,
			created_from: createdFrom,
			messaging_site_id: selectedSiteId || null,
			messaging_url: selectedSiteURL || null,
		} );

		setWaitAnswerToFirstMessageFromHumanSupport( true );
		const updatedInteraction = await addEventToInteraction.mutateAsync( {
			interactionId: currentInteractionID,
			eventData: { event_source: 'zendesk', event_external_id: conversation.id },
		} );
		const eventAddedToNewInteraction = updatedInteraction.uuid !== currentInteractionID;
		if ( eventAddedToNewInteraction ) {
			await Smooch.updateConversation( conversation.id, {
				metadata: {
					supportInteractionId: updatedInteraction.uuid,
				},
			} );
		}

		setChat( ( prevChat ) => ( {
			...prevChat,
			conversationId: conversation.id,
			provider: 'zendesk',
			status: 'loaded',
		} ) );
	};

	return createConversation;
};
