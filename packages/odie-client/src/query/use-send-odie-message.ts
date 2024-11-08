import { useMutation } from '@tanstack/react-query';
import apiFetch from '@wordpress/api-fetch';
import wpcomRequest, { canAccessWpcomApis } from 'wpcom-proxy-request';
import { ODIE_ERROR_MESSAGE, ODIE_RATE_LIMIT_MESSAGE } from '../constants';
import { useOdieAssistantContext } from '../context';
import { broadcastOdieMessage, useGetOdieStorage, useSetOdieStorage } from '../data';
import { generateUUID } from '../utils';
import { useOdieChat } from './use-odie-chat';
import type { Message, Chat } from '../types/';

/**
 * Sends a new message to ODIE.
 * If the chat_id is not set, it will create a new chat and send a message to the chat.
 * @returns useMutation return object.
 */
export const useSendOdieMessage = () => {
	const chatId = useGetOdieStorage( 'chat_id' );
	const storeChatId = useSetOdieStorage( 'chat_id' );
	const { updateCache } = useOdieChat();
	const internal_message_id = generateUUID();

	const {
		botNameSlug,
		selectedSiteId,
		version,
		setChatStatus,
		addMessage,
		odieClientId,
		shouldUseHelpCenterExperience,
	} = useOdieAssistantContext();

	return useMutation< Chat, Error, Message >( {
		mutationFn: async ( message: Message ): Promise< Chat > => {
			const chatIdSegment = chatId ? `/${ chatId }` : '';
			const response = canAccessWpcomApis()
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

			// Assuming the response structure matches the Chat type
			return response as Chat;
		},
		onMutate: () => {
			setChatStatus( 'sending' );
		},
		onSuccess: ( chat, userMessage ) => {
			if ( ! chat.messages || chat.messages.length === 0 || ! chat.messages[ 0 ].content ) {
				const errorMessage: Message = {
					content: ODIE_ERROR_MESSAGE( shouldUseHelpCenterExperience ),
					internal_message_id,
					role: 'bot',
					type: 'error',
				};

				addMessage( errorMessage );
				broadcastOdieMessage( errorMessage, odieClientId );
				return;
			}

			storeChatId( chat.chat_id?.toString() || '' );

			const botMessage: Message = {
				message_id: chat.messages[ 0 ].message_id,
				internal_message_id,
				content: chat.messages[ 0 ].content,
				role: 'bot',
				simulateTyping: chat.messages[ 0 ].simulateTyping,
				type: 'message',
				context: chat.messages[ 0 ].context,
			};

			addMessage( botMessage );
			broadcastOdieMessage( botMessage, odieClientId );
			updateCache( [ userMessage, botMessage ] );
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
			broadcastOdieMessage( errorMessage, odieClientId );
		},
	} );
};
