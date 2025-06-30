import { HelpCenterSelect } from '@automattic/data-stores';
import { HELP_CENTER_STORE } from '@automattic/help-center/src/stores';
import { useUpdateZendeskUserFields } from '@automattic/zendesk-client';
import { useSelect } from '@wordpress/data';
import Smooch from 'smooch';
import { logToLogstash } from 'calypso/lib/logstash'; // eslint-disable-line no-restricted-imports -- this import is safe, not introudcing any circular deps; also, it should be removed shortly after investigating the chats with missing zd ids issue
import { ODIE_ON_ERROR_TRANSFER_MESSAGE, ODIE_TRANSFER_MESSAGE } from '../constants';
import { useOdieAssistantContext } from '../context';
import { useManageSupportInteraction } from '../data';
import { setHelpCenterZendeskConversationStarted } from '../utils';

declare const process: {
	env: {
		NODE_ENV: unknown;
	};
};

const logMessageData = ( {
	createdFrom,
	selectedSiteId,
	selectedSiteURL,
	userFieldFlowName,
	section,
}: {
	createdFrom: string;
	selectedSiteId?: number | null;
	selectedSiteURL?: string | null;
	userFieldFlowName?: string | null;
	section: string | null;
} ) => {
	const stackTrace = Error().stack;

	process.env.NODE_ENV === 'production' &&
		logToLogstash( {
			feature: 'calypso_client',
			message: 'No chat ID on Zendesk chat',
			extra: {
				createdFrom,
				selectedSiteId,
				selectedSiteURL,
				userFieldFlowName,
				section,
				stackTrace,
			},
			tags: [ 'no-chat-id-on-zd-chat' ],
		} );
};

export const useCreateZendeskConversation = (): ( ( {
	avoidTransfer,
	interactionId,
	section,
	createdFrom,
	isFromError,
}: {
	avoidTransfer?: boolean;
	interactionId?: string;
	section?: string | null;
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
		isFromError = false,
	}: {
		avoidTransfer?: boolean;
		interactionId?: string;
		section?: string | null;
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
						...( isFromError ? ODIE_ON_ERROR_TRANSFER_MESSAGE : ODIE_TRANSFER_MESSAGE ),
				  ],
			status: 'transfer',
		} ) );

		if ( ! chatId ) {
			logMessageData( {
				createdFrom,
				selectedSiteId,
				selectedSiteURL,
				userFieldFlowName,
				section,
			} );
		}

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
