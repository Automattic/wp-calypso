import { useUpdateZendeskUserFields } from '@automattic/zendesk-client';
import { useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Smooch from 'smooch';
import { getOdieOnErrorTransferMessage, getOdieTransferMessage } from '../constants';
import { useOdieAssistantContext } from '../context';
import { useManageSupportInteraction } from '../data';
import { useCurrentSupportInteraction } from '../data/use-current-support-interaction';
import type { OdieAllBotSlugs, SupportInteraction } from '../types';

export const useCreateZendeskConversation = () => {
	const {
		selectedSiteId,
		selectedSiteURL,
		userFieldMessage,
		userFieldFlowName,
		setChat,
		chat,
		trackEvent,
	} = useOdieAssistantContext();
	const { data: currentSupportInteraction } = useCurrentSupportInteraction();
	const { isPending: isSubmittingZendeskUserFields, mutateAsync: submitUserFields } =
		useUpdateZendeskUserFields();
	const { addEventToInteraction, startNewInteraction } = useManageSupportInteraction();
	const chatId = chat.odieId;
	const navigate = useNavigate();
	const location = useLocation();

	const updateInteractionContext = useCallback(
		( interaction: SupportInteraction ) => {
			setChat( ( prevChat ) => ( {
				...prevChat,
				supportInteractionId: interaction.uuid,
			} ) );

			const params = new URLSearchParams( location.search );
			if ( params.get( 'id' ) !== interaction.uuid ) {
				params.set( 'id', interaction.uuid );
				navigate( `${ location.pathname }?${ params.toString() }`, { replace: true } );
			}
		},
		[ location.pathname, location.search, navigate, setChat ]
	);

	const createConversation = async ( {
		interactionId = '',
		createdFrom = '',
		isFromError = false,
		errorReason = '',
	}: {
		interactionId?: string;
		createdFrom?: string;
		isFromError?: boolean;
		errorReason?: string;
	} ) => {
		const initialInteractionId = interactionId || currentSupportInteraction?.uuid || '';

		trackEvent( 'create_zendesk_conversation', {
			is_submitting_zendesk_user_fields: isSubmittingZendeskUserFields,
			chat_conversation_id: chat.conversationId,
			chat_status: chat.status,
			chat_provider: chat.provider,
			interaction_id: initialInteractionId || null,
			created_from: createdFrom,
			is_from_error: isFromError,
			error_reason: errorReason || 'Unknown error',
		} );

		if (
			isSubmittingZendeskUserFields ||
			chat.conversationId ||
			chat.status === 'transfer' ||
			chat.provider === 'zendesk'
		) {
			return chat.conversationId || '';
		}

		setChat( ( prevChat ) => ( {
			...prevChat,
			messages: [
				...prevChat.messages,
				...( isFromError
					? getOdieOnErrorTransferMessage()
					: getOdieTransferMessage( currentSupportInteraction?.bot_slug as OdieAllBotSlugs ) ),
			],
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
			trackEvent( 'error_submitting_zendesk_user_fields', {
				error_message:
					error instanceof Error ? error.message : error?.toString?.() ?? 'Unknown error',
			} );
		}

		const conversation = await Smooch.createConversation( {
			metadata: {
				createdAt: Date.now(),
				...( initialInteractionId ? { supportInteractionId: initialInteractionId } : {} ),
				...( chatId ? { odieChatId: chatId } : {} ),
			},
		} );

		let activeInteractionId = initialInteractionId;

		try {
			if ( activeInteractionId ) {
				const interaction = await addEventToInteraction.mutateAsync( {
					interactionId: activeInteractionId,
					eventData: { event_source: 'zendesk', event_external_id: conversation.id },
				} );
				if ( interaction.uuid !== activeInteractionId ) {
					await Smooch.updateConversation( conversation.id, {
						metadata: {
							...conversation.metadata,
							supportInteractionId: interaction.uuid,
						},
					} );
				}
				activeInteractionId = interaction.uuid;
				updateInteractionContext( interaction );
			} else {
				const interaction = await startNewInteraction( {
					event_source: 'zendesk',
					event_external_id: conversation.id,
				} );
				activeInteractionId = interaction.uuid;
				updateInteractionContext( interaction );
				await Smooch.updateConversation( conversation.id, {
					metadata: {
						...conversation.metadata,
						supportInteractionId: interaction.uuid,
					},
				} );
			}
		} catch ( error ) {
			// eslint-disable-next-line no-console
			console.error( 'Failed to sync support interaction during Zendesk escalation', error );
		}

		trackEvent( 'new_zendesk_conversation', {
			support_interaction: activeInteractionId || null,
			created_from: createdFrom,
			messaging_site_id: selectedSiteId || null,
			messaging_url: selectedSiteURL || null,
		} );

		// We need to load the conversation to get typing events. Load simply means "focus on"..
		Smooch.loadConversation( conversation.id );

		setChat( ( prevChat ) => ( {
			...prevChat,
			conversationId: conversation.id,
			provider: 'zendesk',
			status: 'loaded',
		} ) );

		return conversation.id;
	};

	return createConversation;
};
