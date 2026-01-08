import { useUpdateZendeskUserFields, type ZendeskConversation } from '@automattic/zendesk-client';
import { useLocation, useNavigate } from 'react-router-dom';
import Smooch from 'smooch';
import {
	getErrorTryAgainLaterMessage,
	getOdieTransferMessages,
	getZendeskChatStartedMetaMessage,
} from '../constants';
import { useOdieAssistantContext } from '../context';
import { useManageSupportInteraction } from '../data';
import { useCurrentSupportInteraction } from '../data/use-current-support-interaction';

export const useCreateZendeskConversation = () => {
	const {
		selectedSiteId,
		selectedSiteURL,
		userFieldMessage,
		userFieldFlowName,
		setChat,
		chat,
		trackEvent,
		isChatLoaded,
	} = useOdieAssistantContext();
	const { data: currentSupportInteraction } = useCurrentSupportInteraction();
	const { isPending: isSubmittingZendeskUserFields, mutateAsync: submitUserFields } =
		useUpdateZendeskUserFields();
	const { addEventToInteraction, startNewInteraction } = useManageSupportInteraction();
	const chatId = chat.odieId;
	const navigate = useNavigate();
	const location = useLocation();

	const getErrorMessage = ( error: unknown ) =>
		error instanceof Error ? error.message : error?.toString?.() ?? 'Unknown error';

	const createConversation = async ( {
		createdFrom = '',
		isFromError = false,
		errorReason = '',
		escalationOnSecondAttempt = false,
	}: {
		createdFrom?: string;
		isFromError?: boolean;
		errorReason?: string;
		escalationOnSecondAttempt?: boolean;
	} ) => {
		let activeInteractionId = currentSupportInteraction?.uuid;

		trackEvent( 'creating_zendesk_conversation', {
			is_submitting_zendesk_user_fields: isSubmittingZendeskUserFields,
			chat_conversation_id: chat.conversationId,
			chat_status: chat.status,
			chat_provider: chat.provider,
			interaction_id: activeInteractionId,
			created_from: createdFrom,
			is_from_error: isFromError,
			is_chat_loaded: isChatLoaded,
			escalation_on_second_attempt: escalationOnSecondAttempt,
			error_reason: isFromError ? errorReason ?? 'Unknown error' : '',
		} );

		if (
			isSubmittingZendeskUserFields ||
			chat.conversationId ||
			chat.status === 'transfer' ||
			chat.provider === 'zendesk'
		) {
			return chat.conversationId || '';
		}

		// Store previous state to restore on error
		const previousMessages = [ ...chat.messages ];
		const previousProvider = chat.provider;
		const previousConversationId = chat.conversationId;

		const handleErrorCreatingZendeskConversation = ( errorType: string, error?: unknown ) => {
			trackEvent( errorType, {
				error_message: getErrorMessage( error ),
				created_from: createdFrom,
				escalation_on_second_attempt: escalationOnSecondAttempt,
				active_interaction_id: activeInteractionId || null,
				is_chat_loaded: isChatLoaded,
			} );

			setChat( {
				messages: [ ...previousMessages, getErrorTryAgainLaterMessage() ],
				status: 'loaded',
				provider: previousProvider,
				conversationId: previousConversationId,
				odieId: chat.odieId,
				wpcomUserId: chat.wpcomUserId,
				clientId: chat.clientId,
			} );
		};

		setChat( ( prevChat ) => ( {
			...prevChat,
			status: 'transfer',
		} ) );

		try {
			trackEvent( 'submitting_zendesk_user_fields', {
				messaging_initial_message: userFieldMessage || undefined,
				messaging_site_id: selectedSiteId || null,
				messaging_ai_chat_id: chatId || undefined,
				messaging_url: selectedSiteURL || window.location.href,
				messaging_flow: userFieldFlowName || null,
				messaging_source: window.location.href,
			} );

			await submitUserFields( {
				messaging_initial_message: userFieldMessage || undefined,
				messaging_site_id: selectedSiteId || null,
				messaging_ai_chat_id: chatId || undefined,
				messaging_url: selectedSiteURL || window.location.href,
				messaging_flow: userFieldFlowName || null,
				messaging_source: window.location.href,
			} );

			trackEvent( 'submitted_zendesk_user_fields' );
		} catch ( error ) {
			handleErrorCreatingZendeskConversation( 'error_submitting_zendesk_user_fields', error );
			return;
		}

		let conversation: ZendeskConversation | null = null;
		let interaction = null;

		try {
			conversation = await Smooch.createConversation( {
				metadata: {
					createdAt: Date.now(),
					...( activeInteractionId ? { supportInteractionId: activeInteractionId } : {} ),
					...( chatId ? { odieChatId: chatId } : {} ),
				},
			} );
		} catch ( error ) {
			handleErrorCreatingZendeskConversation( 'error_creating_zendesk_conversation', error );
			return;
		}

		try {
			if ( activeInteractionId ) {
				interaction = await addEventToInteraction( {
					interactionId: activeInteractionId,
					eventData: { event_source: 'zendesk', event_external_id: conversation.id },
				} );
			} else {
				interaction = await startNewInteraction( {
					event_source: 'zendesk',
					event_external_id: conversation.id,
				} );
			}
		} catch ( error ) {
			handleErrorCreatingZendeskConversation( 'error_updating_interaction', error );
			return;
		}

		try {
			if ( interaction.uuid !== activeInteractionId ) {
				await Smooch.updateConversation( conversation.id, {
					metadata: {
						...conversation.metadata,
						supportInteractionId: interaction.uuid,
					},
				} );
				activeInteractionId = interaction.uuid;
			}

			if ( ! conversation?.id ) {
				throw new Error( 'Failed to create conversation: conversation is null or missing id' );
			}

			const conversationId = conversation.id;

			// We need to load the conversation to get typing events. Load simply means "focus on"..
			Smooch.loadConversation( conversationId );

			setChat( ( prevChat ) => ( {
				...prevChat,
				conversationId: conversationId,
				messages: [
					...prevChat.messages,
					...getOdieTransferMessages( currentSupportInteraction?.bot_slug ),
					getZendeskChatStartedMetaMessage(),
				],
				provider: 'zendesk',
				status: 'loaded',
			} ) );

			// Track success only if conversation was created
			trackEvent( 'new_zendesk_conversation', {
				support_interaction: activeInteractionId || null,
				created_from: createdFrom,
				messaging_site_id: selectedSiteId || null,
				messaging_url: selectedSiteURL || null,
			} );

			// If the interaction id has changed, update the URL.
			if ( activeInteractionId && currentSupportInteraction?.uuid !== activeInteractionId ) {
				const params = new URLSearchParams( location.search );
				if ( params.get( 'id' ) !== activeInteractionId ) {
					params.set( 'id', activeInteractionId );
					navigate( `${ location.pathname }?${ params.toString() }`, { replace: true } );
				}
			}

			return conversationId;
		} catch ( error ) {
			handleErrorCreatingZendeskConversation( 'error_finalizing_zendesk_conversation', error );
			return;
		}
	};

	return createConversation;
};
