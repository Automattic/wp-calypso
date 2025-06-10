import { HelpCenterSelect } from '@automattic/data-stores';
import { HELP_CENTER_STORE } from '@automattic/help-center/src/stores';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import apiFetch from '@wordpress/api-fetch';
import { useSelect } from '@wordpress/data';
import wpcomRequest, { canAccessWpcomApis } from 'wpcom-proxy-request';
import {
	ODIE_ERROR_MESSAGE,
	ODIE_RATE_LIMIT_MESSAGE,
	ODIE_EMAIL_FALLBACK_MESSAGE,
} from '../constants';
import { useOdieAssistantContext } from '../context';
import { useCreateZendeskConversation } from '../hooks';
import { generateUUID, getOdieIdFromInteraction, getIsRequestingHumanSupport } from '../utils';
import { useManageSupportInteraction, broadcastOdieMessage } from '.';
import type { Chat, Message, ReturnedChat } from '../types';

/**
 * Sends a new message to ODIE.
 * If the chat_id is not set, it will create a new chat and send a message to the chat.
 * @returns useMutation return object.
 */
export const useSendOdieMessage = () => {
	const { currentSupportInteraction, odieId } = useSelect( ( select ) => {
		const store = select( HELP_CENTER_STORE ) as HelpCenterSelect;
		const currentSupportInteraction = store.getCurrentSupportInteraction();
		const odieId = getOdieIdFromInteraction( currentSupportInteraction );

		return {
			currentSupportInteraction: store.getCurrentSupportInteraction(),
			odieId,
		};
	}, [] );

	const { addEventToInteraction } = useManageSupportInteraction();
	const newConversation = useCreateZendeskConversation();
	const internal_message_id = generateUUID();
	const queryClient = useQueryClient();

	const {
		botNameSlug,
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
	} = useOdieAssistantContext();

	/*
		Adds a message to the chat.
		If the message is a request for human support, it will escalate the chat to human support, if eligible.
		If email support is forced, it will add an email fallback message.
	*/
	const addMessage = ( message: Message | Message[], props?: Partial< Chat > ) => {
		if ( ! Array.isArray( message ) ) {
			if ( getIsRequestingHumanSupport( message ) ) {
				if ( forceEmailSupport ) {
					setChat( ( prevChat ) => ( {
						...prevChat,
						...props,
						messages: [ ...prevChat.messages, ...[ ODIE_EMAIL_FALLBACK_MESSAGE ] ],
						status: 'loaded',
					} ) );
					return;
				} else if ( ! chat.conversationId && canConnectToZendesk && isUserEligibleForPaidSupport ) {
					newConversation( { createdFrom: 'automatic_escalation' } );
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
			const chatIdSegment = odieId ? `/${ odieId }` : '';
			return canAccessWpcomApis()
				? await wpcomRequest( {
						method: 'POST',
						path: `/odie/chat/${ botNameSlug }${ chatIdSegment }`,
						apiNamespace: 'wpcom/v2',
						body: {
							message: message.content,
							...( version && { version } ),
							context: { selectedSiteId },
						},
				  } )
				: await apiFetch( {
						path: `/help-center/odie/chat/${ botNameSlug }${ chatIdSegment }`,
						method: 'POST',
						data: {
							message: message.content,
							...( version && { version } ),
							context: { selectedSiteId },
						},
				  } );
		},
		onMutate: () => {
			setChatStatus( 'sending' );
		},
		onSuccess: ( returnedChat ) => {
			if (
				! returnedChat.messages ||
				returnedChat.messages.length === 0 ||
				! returnedChat.messages[ 0 ].content
			) {
				const errorMessage: Message = {
					content: ODIE_ERROR_MESSAGE,
					internal_message_id,
					role: 'bot',
					type: 'error',
				};

				addMessage( errorMessage );

				broadcastOdieMessage( errorMessage, odieBroadcastClientId );
				return;
			}

			if ( ! odieId ) {
				addEventToInteraction.mutate( {
					interactionId: currentSupportInteraction!.uuid,
					eventData: {
						event_external_id: returnedChat.chat_id.toString(),
						event_source: 'odie',
					},
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
			addMessage( botMessage, { odieId: returnedChat.chat_id } );
			broadcastOdieMessage( botMessage, odieBroadcastClientId );
		},
		onSettled: () => {
			queryClient.invalidateQueries( { queryKey: [ 'odie-chat', botNameSlug, odieId ] } );
		},
		onError: ( error ) => {
			const isRateLimitError = error.message.includes( '429' );
			const errorMessage: Message = {
				content: isRateLimitError ? ODIE_RATE_LIMIT_MESSAGE : ODIE_ERROR_MESSAGE,
				internal_message_id,
				role: 'bot',
				type: 'error',
			};
			addMessage( errorMessage );
			broadcastOdieMessage( errorMessage, odieBroadcastClientId );
		},
	} );
};
