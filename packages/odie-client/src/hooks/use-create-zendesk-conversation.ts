import { useHasEnTranslation } from '@automattic/i18n-utils';
import {
	useUpdateZendeskUserFields,
	ZENDESK_CUSTOM_FIELD_AI_CHAT_ID,
	ZENDESK_CUSTOM_FIELD_WEBSITE_URL,
	ZENDESK_SOURCE_URL_TICKET_FIELD_ID,
	type ZendeskConversation,
} from '@automattic/zendesk-client';
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
import { getOpenLiveInteractions } from '../utils/get-open-live-interactions';
import { useOpenInteractionStatusMap } from './use-open-interaction-status-map';

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
	const interactionStatusByUuid = useOpenInteractionStatusMap();
	const hasEnTranslation = useHasEnTranslation();

	const getErrorMessage = ( error: unknown ) =>
		error instanceof Error ? error.message : error?.toString?.() ?? 'Unknown error';

	// The Smooch (Zendesk Web Messenger) SDK is initialized asynchronously elsewhere.
	// When an escalation fires before init completes, `Smooch.createConversation` is
	// either missing ("createConversation is not a function") or throws because the
	// messenger isn't initialized yet. Both are transient — retry until it's ready.
	const isSmoochNotReadyError = ( error: unknown ) => {
		const message = getErrorMessage( error );
		return (
			message.includes( 'createConversation is not a function' ) ||
			message.includes( 'Must initialize the Web Messenger' )
		);
	};

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
		if (
			isSubmittingZendeskUserFields ||
			chat.conversationId ||
			chat.status === 'transfer' ||
			chat.provider === 'zendesk'
		) {
			return chat.conversationId || '';
		}

		// Compute from a fresh Smooch snapshot at call time: Smooch can mutate its
		// conversation list outside React without triggering a re-render.
		const { hasReachedLimit } = getOpenLiveInteractions( interactionStatusByUuid );

		if ( hasReachedLimit ) {
			trackEvent( 'conversation_limit_reached', {
				created_from: createdFrom,
			} );
			setChat( ( prevChat ) => ( {
				...prevChat,
				status: 'loaded',
			} ) );
			return;
		}

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

		// Store previous state to restore on error
		const previousMessages = [ ...chat.messages ];
		const previousProvider = chat.provider;
		const previousConversationId = chat.conversationId;

		// Time spent waiting for the Smooch SDK to become ready, and how many
		// createConversation attempts it took (see the retry loop below).
		// attempts > 1 means the retry rescued an otherwise-failed escalation.
		let smoochWaitedMs = 0;
		let smoochAttempts = 0;

		const handleErrorCreatingZendeskConversation = ( errorType: string, error?: unknown ) => {
			trackEvent( errorType, {
				error_message: getErrorMessage( error ),
				created_from: createdFrom,
				escalation_on_second_attempt: escalationOnSecondAttempt,
				active_interaction_id: activeInteractionId || null,
				is_chat_loaded: isChatLoaded,
				smooch_waited_ms: smoochWaitedMs,
				smooch_attempts: smoochAttempts,
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

		// The messaging user fields submitted above can take up to a minute to become
		// visible to Zendesk's ticket-creation triggers, so tickets created within
		// seconds of a user's first contact come out with blank Site URL / Started
		// from. Ticket-field metadata travels atomically with the conversation, so
		// duplicate the critical fields here. See DOTSUP-472.
		const ticketFieldMetadata = {
			[ `zen:ticket_field:${ ZENDESK_CUSTOM_FIELD_WEBSITE_URL }` ]:
				selectedSiteURL || window.location.href,
			[ `zen:ticket_field:${ ZENDESK_SOURCE_URL_TICKET_FIELD_ID }` ]: window.location.href,
			...( chatId
				? { [ `zen:ticket_field:${ ZENDESK_CUSTOM_FIELD_AI_CHAT_ID }` ]: String( chatId ) }
				: {} ),
		};

		const SMOOCH_READY_TIMEOUT_MS = 10000;
		const SMOOCH_RETRY_INTERVAL_MS = 250;
		const smoochReadyDeadline = Date.now() + SMOOCH_READY_TIMEOUT_MS;

		for (;;) {
			try {
				smoochAttempts++;
				conversation = await Smooch.createConversation( {
					metadata: {
						createdAt: Date.now(),
						...( activeInteractionId ? { supportInteractionId: activeInteractionId } : {} ),
						...( chatId ? { odieChatId: chatId } : {} ),
						...ticketFieldMetadata,
					},
				} );
				break;
			} catch ( error ) {
				const remainingMs = smoochReadyDeadline - Date.now();
				if ( isSmoochNotReadyError( error ) && remainingMs > 0 ) {
					// Cap the sleep to the time left so we never overshoot the deadline.
					const sleepMs = Math.min( SMOOCH_RETRY_INTERVAL_MS, remainingMs );
					// Only the backoff sleeps count as wait time, not the SDK call itself.
					smoochWaitedMs += sleepMs;
					await new Promise( ( resolve ) => setTimeout( resolve, sleepMs ) );
					continue;
				}
				handleErrorCreatingZendeskConversation( 'error_creating_zendesk_conversation', error );
				return;
			}
		}

		if ( ! conversation ) {
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
					...getOdieTransferMessages( currentSupportInteraction?.bot_slug, hasEnTranslation ),
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
				smooch_waited_ms: smoochWaitedMs,
				smooch_attempts: smoochAttempts,
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
