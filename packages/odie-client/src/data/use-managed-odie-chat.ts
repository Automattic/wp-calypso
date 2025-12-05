import { useMutation, useQueryClient } from '@tanstack/react-query';
import apiFetch from '@wordpress/api-fetch';
import { useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import wpcomRequest, { canAccessWpcomApis } from 'wpcom-proxy-request';
import { useOdieAssistantContext } from '../context';
import { useOdieChat } from './use-odie-chat';
import type { ReturnedChat, Message, AgentticMessage, OdieChat } from '../types';

function convertMessageToAgentticFormat( message: Message ): AgentticMessage {
	return {
		content: [ { type: 'text', text: message.content as string } ],
		role: message.role as 'agent',
		timestamp: message.received as number,
		id: message.message_id?.toString() ?? '',
		actions: [],
		archived: false,
		showIcon: true,
	};
}

function convertMessageFromAgentticFormat( message: string ): Message {
	return {
		content: message,
		role: 'user',
		type: 'message',
	};
}

/**
 * Sends a new message to ODIE.
 * If the chat_id is not set, it will create a new chat and send a message to the chat.
 * @param odieChatId - The Odie chat ID to send the message to.
 * @param botSlug - The bot slug to send the message to.
 * @param onSuccess - A callback function to call when the message is sent successfully.
 * @returns useMutation return object.
 */
export const useSendOdieMessage = (
	odieChatId: number | null,
	botSlug: string,
	onSuccess: ( chat: ReturnedChat ) => void
) => {
	const { selectedSiteId, version } = useOdieAssistantContext();
	const queryClient = useQueryClient();

	return useMutation< ReturnedChat, Error, Message >( {
		mutationFn: async ( message: Message ): Promise< ReturnedChat > => {
			const chatIdSegment = odieChatId ? `/${ odieChatId }` : '';
			const url = window.location.href;
			const pathname = window.location.pathname;

			return canAccessWpcomApis()
				? wpcomRequest< ReturnedChat >( {
						method: 'POST',
						path: `/odie/chat/${ botSlug }${ chatIdSegment }`,
						apiNamespace: 'wpcom/v2',
						body: {
							message: message.content,
							...( version && { version } ),
							context: { selectedSiteId, url, pathname },
						},
				  } )
				: apiFetch< ReturnedChat >( {
						path: `/help-center/odie/chat/${ botSlug }${ chatIdSegment }`,
						method: 'POST',
						data: {
							message: message.content,
							...( version && { version } ),
							context: { selectedSiteId, url, pathname },
						},
				  } );
		},
		onMutate( message: Message ) {
			queryClient.setQueryData(
				[ 'odie-chat', botSlug, odieChatId, version ],
				( currentChatCache: OdieChat ) => {
					return {
						...currentChatCache,
						messages: [ ...( currentChatCache?.messages ?? [] ), message ],
					};
				}
			);
		},
		onSuccess( data: ReturnedChat ) {
			const chatId = data.chat_id;
			queryClient.setQueryData(
				[ 'odie-chat', botSlug, chatId, version ],
				( currentChatCache: OdieChat ) => {
					return {
						...currentChatCache,
						messages: [ ...( currentChatCache?.messages ?? [] ), ...data.messages ],
					};
				}
			);
			onSuccess( data );
		},
	} );
};

/**
 * Get a full API of an Odie chat.
 * @param botSlug - The bot slug to send the message to.
 */
export const useManagedOdieChat = ( botSlug: string ) => {
	const chatId = new URLSearchParams( useLocation().search ).get( 'odieChatId' );
	const { data: chat, isFetching: isLoadingChat } = useOdieChat( chatId ? Number( chatId ) : null );
	const navigate = useNavigate();

	const onSuccess = useCallback(
		( returnedChat: ReturnedChat ) => {
			const newChatId = returnedChat.chat_id;
			if ( newChatId !== Number( chatId ) ) {
				navigate( `/odie?odieChatId=${ newChatId }`, { replace: true } );
			}
		},
		[ chatId, navigate ]
	);

	const sendOdieMessage = useSendOdieMessage(
		chatId ? Number( chatId ) : null,
		botSlug,
		onSuccess
	);

	function sendMessage( message: string ) {
		const odieMessage = convertMessageFromAgentticFormat( message );
		sendOdieMessage.mutateAsync( odieMessage );
	}

	return {
		messages: chat?.messages.map( convertMessageToAgentticFormat ) || [],
		sendMessage,
		isProcessing: sendOdieMessage.isPending || isLoadingChat,
	};
};
