import { useMutation } from '@tanstack/react-query';
import apiFetch from '@wordpress/api-fetch';
import wpcomRequest, { canAccessWpcomApis } from 'wpcom-proxy-request';
import { ODIE_ERROR_MESSAGE, ODIE_RATE_LIMIT_MESSAGE } from '../constants';
import { useOdieAssistantContext } from '../context';
import { generateUUID } from '../utils';
import { useManageSupportInteraction, broadcastOdieMessage } from '.';
import type { Message, ReturnedChat } from '../types';

/**
 * Sends a new message to ODIE.
 * If the chat_id is not set, it will create a new chat and send a message to the chat.
 * @returns useMutation return object.
 */
export const useSendOdieMessage = () => {
	const { addEventToInteraction } = useManageSupportInteraction();
	const internal_message_id = generateUUID();

	const {
		botNameSlug,
		selectedSiteId,
		version,
		addMessage,
		odieBroadcastClientId,
		chat,
		setChatStatus,
		shouldUseHelpCenterExperience,
	} = useOdieAssistantContext();

	return useMutation< ReturnedChat, Error, Message >( {
		mutationFn: async ( message: Message ): Promise< ReturnedChat > => {
			const chatIdSegment = chat.odieId ? `/${ chat.odieId }` : '';
			return canAccessWpcomApis()
				? await wpcomRequest( {
						method: 'POST',
						path: `/odie/chat/${ botNameSlug }${ chatIdSegment }`,
						apiNamespace: 'wpcom/v2',
						body: { message: message.content, version, context: { selectedSiteId } },
				  } )
				: await apiFetch( {
						path: `/help-center/odie/chat/${ botNameSlug }${ chatIdSegment }`,
						method: 'POST',
						data: { message: message.content, version, context: { selectedSiteId } },
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
					content: ODIE_ERROR_MESSAGE( shouldUseHelpCenterExperience ),
					internal_message_id,
					role: 'bot',
					type: 'error',
				};

				addMessage( errorMessage );
				broadcastOdieMessage( errorMessage, odieBroadcastClientId );
				return;
			}

			if ( ! chat.odieId ) {
				addEventToInteraction( {
					interactionId: chat.supportInteractionId as string,
					eventData: {
						event_external_id: returnedChat.chat_id,
						// @ts-expect-error - sending and receiving events are not exactly the same.
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

			addMessage( botMessage );
			broadcastOdieMessage( botMessage, odieBroadcastClientId );
		},
		onSettled: () => {
			setChatStatus( 'loaded' );
		},
		onError: ( error ) => {
			const isRateLimitError = error.message.includes( '429' );
			const errorMessage: Message = {
				content: isRateLimitError
					? ODIE_RATE_LIMIT_MESSAGE
					: ODIE_ERROR_MESSAGE( shouldUseHelpCenterExperience ),
				internal_message_id,
				role: 'bot',
				type: 'error',
			};
			addMessage( errorMessage );
			broadcastOdieMessage( errorMessage, odieBroadcastClientId );
		},
	} );
};
