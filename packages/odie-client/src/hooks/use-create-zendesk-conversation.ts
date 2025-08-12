import { HelpCenterSelect } from '@automattic/data-stores';
import { HELP_CENTER_STORE } from '@automattic/help-center/src/stores';
import { useUpdateZendeskUserFields } from '@automattic/zendesk-client';
import { useSelect } from '@wordpress/data';
import Smooch from 'smooch';
import { getOdieOnErrorTransferMessage, getOdieTransferMessage } from '../constants';
import { useOdieAssistantContext } from '../context';
import { useManageSupportInteraction } from '../data';

export const useCreateZendeskConversation = (): ( ( {
	avoidTransfer,
	interactionId,
	createdFrom,
	isFromError,
}: {
	avoidTransfer?: boolean;
	interactionId?: string;
	createdFrom?: string;
	isFromError?: boolean;
} ) => Promise< void > ) => {
	const {
		selectedSiteId,
		selectedSiteURL,
		userFieldMessage,
		userFieldFlowName,
		setChat,
		chat,
		trackEvent,
		sectionName,
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
		isFromError = false,
	}: {
		avoidTransfer?: boolean;
		interactionId?: string;
		createdFrom?: string;
		isFromError?: boolean;
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
				: [
						...prevChat.messages,
						...( isFromError ? getOdieOnErrorTransferMessage() : getOdieTransferMessage() ),
				  ],
			status: 'transfer',
		} ) );

		await submitUserFields( {
			messaging_initial_message: userFieldMessage || undefined,
			messaging_site_id: selectedSiteId || null,
			messaging_ai_chat_id: chatId || undefined,
			messaging_url: selectedSiteURL || window.location.href,
			messaging_flow: userFieldFlowName || null,
			messaging_source: sectionName,
		} );
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
