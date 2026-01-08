import { useMutation, useQueryClient } from '@tanstack/react-query';
import apiFetch from '@wordpress/api-fetch';
import { useCallback, useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import wpcomRequest, { canAccessWpcomApis } from 'wpcom-proxy-request';
import getMostRecentOpenLiveInteraction from '../components/notices/get-most-recent-open-live-interaction';
import {
	getOdieRateLimitMessage,
	getOdieEmailFallbackMessage,
	getOdieErrorMessageNonEligible,
	getExistingConversationMessage,
	ODIE_DEFAULT_BOT_SLUG_LEGACY,
	getErrorMessageUnknownError,
} from '../constants';
import { useOdieAssistantContext } from '../context';
import { useCreateZendeskConversation } from '../hooks';
import { generateUUID, getOdieIdFromInteraction, getIsRequestingHumanSupport } from '../utils';
import { hasRecentEscalationAttempt } from '../utils/chat-utils';
import { useCurrentSupportInteraction } from './use-current-support-interaction';
import { useManageSupportInteraction, broadcastOdieMessage } from '.';
import type { Chat, Message, ReturnedChat, SupportInteraction } from '../types';

function getBotSlug(
	supportInteraction: SupportInteraction | undefined,
	newInteractionsBotSlug: string
): string {
	if ( supportInteraction ) {
		// Legacy support interactions have their botSlug set to `''`. We need to use the legacy bot slug for them.
		return supportInteraction.bot_slug || ODIE_DEFAULT_BOT_SLUG_LEGACY;
	}

	// When the interaction is undefined, it means we're sending the first message to Odie, which is done before the interaction is created.
	// In this case, we use the new interactions bot slug.
	return newInteractionsBotSlug;
}

const getErrorMessageForSiteIdAndInternalMessageId = (
	selectedSiteId: number | null | undefined,
	internal_message_id: string
): Message => {
	return {
		content: getOdieErrorMessageNonEligible(),
		internal_message_id,
		role: 'bot',
		type: 'message',
		context: {
			site_id: selectedSiteId ?? null,
			flags: {
				forward_to_human_support: true,
				hide_disclaimer_content: false,
				show_ai_avatar: true,
				is_error_message: true,
			},
		},
	};
};

/**
 * Sends a new message to ODIE.
 * If the chat_id is not set, it will create a new chat and send a message to the chat.
 * @returns useMutation return object.
 */
export const useSendOdieMessage = ( signal: AbortSignal ) => {
	const { data: currentSupportInteraction } = useCurrentSupportInteraction();
	const odieId = getOdieIdFromInteraction( currentSupportInteraction );

	const { addEventToInteraction, startNewInteraction } = useManageSupportInteraction();
	const createZendeskConversation = useCreateZendeskConversation();

	const internal_message_id = generateUUID();
	const queryClient = useQueryClient();
	const navigate = useNavigate();
	const location = useLocation();
	const [ shouldCreateConversation, setShouldCreateConversation ] = useState< {
		createdFrom?: string;
		isFromError?: boolean;
		escalationOnSecondAttempt?: boolean;
		trigger: boolean;
	} >( { isFromError: false, trigger: false } );

	useEffect( () => {
		const { createdFrom, isFromError, escalationOnSecondAttempt, trigger } =
			shouldCreateConversation;

		if ( trigger ) {
			createZendeskConversation( { createdFrom, isFromError, escalationOnSecondAttempt } );
			setShouldCreateConversation( { createdFrom: undefined, isFromError: false, trigger: false } );
		}
	}, [ createZendeskConversation, shouldCreateConversation ] );

	const {
		selectedSiteId,
		version,
		setChat,
		odieBroadcastClientId,
		setChatStatus,
		setExperimentVariationName,
		chat,
		isUserEligibleForPaidSupport,
		canConnectToZendesk,
		forceEmailSupport,
		trackEvent,
		newInteractionsBotSlug,
	} = useOdieAssistantContext();

	const updateInteractionContext = useCallback(
		( interaction: SupportInteraction ) => {
			const params = new URLSearchParams( location.search );
			params.set( 'id', interaction.uuid );
			navigate( `${ location.pathname }?${ params.toString() }`, { replace: true } );
		},
		[ location.pathname, location.search, navigate ]
	);

	const hasBeenWarnedAboutExistingConversation = chat?.messages?.some(
		( message ) =>
			message.internal_message_id === getExistingConversationMessage().internal_message_id
	);

	const hasTriedToEscalateToSupport = hasRecentEscalationAttempt( chat );

	/*
		Adds a message to the chat.
		If the message is a request for human support, it will escalate the chat to human support, if eligible.
		If email support is forced, it will add an email fallback message.
	*/
	const addMessage = ( {
		message,
		props = {},
		isFromError = false,
	}: {
		message: Message | Message[];
		props?: Partial< Chat >;
		isFromError: boolean;
	} ) => {
		const warnAboutExistingConversation = getMostRecentOpenLiveInteraction();

		if ( ! Array.isArray( message ) ) {
			if ( getIsRequestingHumanSupport( message ) ) {
				if ( forceEmailSupport ) {
					setChat( ( prevChat ) => ( {
						...prevChat,
						...props,
						messages: [ ...prevChat.messages, getOdieEmailFallbackMessage() ],
						status: 'loaded',
					} ) );
					broadcastOdieMessage( message, odieBroadcastClientId );
					return;
				} else if (
					warnAboutExistingConversation &&
					! hasBeenWarnedAboutExistingConversation &&
					! hasTriedToEscalateToSupport
				) {
					setChat( ( prevChat ) => ( {
						...prevChat,
						...props,
						messages: [ ...prevChat.messages, getExistingConversationMessage() ],
						status: 'loaded',
					} ) );
					broadcastOdieMessage( message, odieBroadcastClientId );
					return;
				} else if ( ! chat.conversationId && canConnectToZendesk && isUserEligibleForPaidSupport ) {
					setChat( ( prevChat ) => ( {
						...prevChat,
						...props,
					} ) );

					// Trigger the `newConversation` mutation to be run inside `useEffect`, so the latest `chat` state is used.
					setShouldCreateConversation( {
						trigger: true,
						createdFrom: 'automatic_escalation',
						isFromError,
						escalationOnSecondAttempt: hasTriedToEscalateToSupport,
					} );
					broadcastOdieMessage( message, odieBroadcastClientId );
					return;
				}

				trackEvent( 'failed_to_escallate_to_support', {
					odie_id: chat?.odieId,
					chat_conversation_id: chat?.conversationId,
					can_connect_to_zendesk: canConnectToZendesk,
					is_user_eligible_for_paid_support: isUserEligibleForPaidSupport,
					warn_about_existing_conversation: warnAboutExistingConversation,
					has_been_warned_about_existing_conversation: hasBeenWarnedAboutExistingConversation,
				} );
			}
		}

		setChat( ( prevChat ) => ( {
			...prevChat,
			...props,
			messages: [ ...prevChat.messages, ...( Array.isArray( message ) ? message : [ message ] ) ],
			status: 'loaded',
		} ) );
	};

	return useMutation< ReturnedChat, Error, Message >( {
		mutationFn: async ( message: Message ): Promise< ReturnedChat > => {
			const botSlug = getBotSlug( currentSupportInteraction, newInteractionsBotSlug );
			const chatIdSegment = odieId ? `/${ odieId }` : '';
			const url = window.location.href;
			const pathname = window.location.pathname;

			const currentScreen = { url };

			return canAccessWpcomApis()
				? wpcomRequest< ReturnedChat >( {
						method: 'POST',
						path: `/odie/chat/${ botSlug }${ chatIdSegment }`,
						apiNamespace: 'wpcom/v2',
						signal,
						body: {
							message: message.content,
							...( version && { version } ),
							context: { selectedSiteId, currentScreen, pathname },
						},
				  } )
				: apiFetch< ReturnedChat >( {
						path: `/help-center/odie/chat/${ botSlug }${ chatIdSegment }`,
						method: 'POST',
						signal,
						data: {
							message: message.content,
							...( version && { version } ),
							context: { selectedSiteId, currentScreen, pathname },
						},
				  } );
		},
		onMutate: () => {
			setChatStatus( 'sending' );
		},
		onSuccess: async ( returnedChat ) => {
			if (
				! returnedChat.messages ||
				returnedChat.messages.length === 0 ||
				! returnedChat.messages[ 0 ].content
			) {
				// Handle empty/error response based on user eligibility
				if ( isUserEligibleForPaidSupport && canConnectToZendesk ) {
					// User is eligible for premium support - transfer to Zendesk
					// Note: newConversation will add the ODIE_ON_ERROR_TRANSFER_MESSAGE automatically
					createZendeskConversation( {
						createdFrom: 'empty_response_error',
						isFromError: true,
						errorReason: `messages: ${ returnedChat.messages
							?.map( ( message ) => message.content )
							.join( '|' ) }`,
					} );
				} else {
					// User is not eligible for premium support - show error message with support buttons
					const errorMessage = getErrorMessageForSiteIdAndInternalMessageId(
						selectedSiteId,
						internal_message_id
					);

					addMessage( { message: errorMessage, props: {}, isFromError: true } );
				}
				return;
			}

			const chatId = returnedChat.chat_id;
			let supportInteraction = currentSupportInteraction;

			try {
				if ( ! supportInteraction && chatId ) {
					supportInteraction = await startNewInteraction( {
						event_external_id: chatId.toString(),
						event_source: 'odie',
					} );
				} else if ( supportInteraction && ! odieId && chatId ) {
					supportInteraction = await addEventToInteraction( {
						interactionId: supportInteraction.uuid,
						eventData: {
							event_external_id: chatId.toString(),
							event_source: 'odie',
						},
					} );
				}
			} catch ( error ) {
				trackEvent( 'error_updating_support_interaction', {
					error_message:
						error instanceof Error ? error.message : error?.toString?.() ?? 'Unknown error',
					existing_interaction_id: supportInteraction?.uuid ?? null,
					chat_id: chatId ?? null,
				} );
			}

			if ( supportInteraction ) {
				updateInteractionContext( supportInteraction );
			}

			const botMessage: Message = {
				message_id: returnedChat.messages[ 0 ].message_id,
				internal_message_id,
				content: returnedChat.messages[ 0 ].content,
				role: 'bot',
				simulateTyping: returnedChat.messages[ 0 ].simulateTyping,
				type: 'message',
				context: returnedChat.messages[ 0 ].context,
			};
			setExperimentVariationName( returnedChat.experiment_name );
			addMessage( {
				message: botMessage,
				props: { odieId: returnedChat.chat_id },
				isFromError: false,
			} );
		},
		onSettled: () => {
			queryClient.invalidateQueries( {
				queryKey: [ 'odie-chat', currentSupportInteraction?.bot_slug, odieId ],
			} );
		},
		onError: ( error ) => {
			if ( error instanceof Event && error.type === 'abort' ) {
				return;
			}

			const isRateLimitError = error.message.includes( '429' );

			if ( isRateLimitError ) {
				// Handle rate limit error with standard rate limit message
				const message: Message = { ...getOdieRateLimitMessage(), internal_message_id };
				addMessage( { message, props: {}, isFromError: true } );
			} else if ( isUserEligibleForPaidSupport && canConnectToZendesk ) {
				const errorMessage = getErrorMessageUnknownError();
				addMessage( { message: errorMessage, props: {}, isFromError: true } );

				trackEvent( 'error_sending_odie_message', {
					error_message: error instanceof Error ? error.toString() : 'unknown_error',
				} );
			} else {
				// User is not eligible for premium support - show error message with support buttons
				const errorMessage: Message = getErrorMessageForSiteIdAndInternalMessageId(
					selectedSiteId,
					internal_message_id
				);

				addMessage( { message: errorMessage, props: {}, isFromError: true } );
			}
		},
	} );
};
