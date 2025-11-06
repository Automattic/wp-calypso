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
} from '../constants';
import { useOdieAssistantContext } from '../context';
import { useCreateZendeskConversation } from '../hooks';
import { generateUUID, getOdieIdFromInteraction, getIsRequestingHumanSupport } from '../utils';
import { useCurrentSupportInteraction } from './use-current-support-interaction';
import { useManageSupportInteraction, broadcastOdieMessage } from '.';
import type { Chat, Message, ReturnedChat, SupportInteraction } from '../types';

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
				show_contact_support_msg: true,
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
		trigger: boolean;
	} >( { isFromError: false, trigger: false } );

	useEffect( () => {
		const { createdFrom, isFromError, trigger } = shouldCreateConversation;

		if ( trigger ) {
			createZendeskConversation( { createdFrom, isFromError } );
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
				} else if ( warnAboutExistingConversation && ! hasBeenWarnedAboutExistingConversation ) {
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
					} );
					broadcastOdieMessage( message, odieBroadcastClientId );
					return;
				}
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
			const botSlug = currentSupportInteraction?.bot_slug || ODIE_DEFAULT_BOT_SLUG_LEGACY;
			const chatIdSegment = odieId ? `/${ odieId }` : '';
			const path = window.location.pathname + window.location.search;
			return canAccessWpcomApis()
				? wpcomRequest< ReturnedChat >( {
						method: 'POST',
						path: `/odie/chat/${ botSlug }${ chatIdSegment }`,
						apiNamespace: 'wpcom/v2',
						signal,
						body: {
							message: message.content,
							...( version && { version } ),
							context: { selectedSiteId, path },
						},
				  } )
				: apiFetch< ReturnedChat >( {
						path: `/help-center/odie/chat/${ botSlug }${ chatIdSegment }`,
						method: 'POST',
						signal,
						data: {
							message: message.content,
							...( version && { version } ),
							context: { selectedSiteId, path },
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
					supportInteraction = await addEventToInteraction.mutateAsync( {
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

			if ( supportInteraction ) {
				updateInteractionContext( supportInteraction );
			}
		},
		onSettled: () => {
			setChatStatus( 'loaded' );
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
				// User is eligible for premium support - transfer to Zendesk
				createZendeskConversation( {
					createdFrom: 'api_error',
					errorReason: error.message || error.toString?.(),
					isFromError: true,
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
