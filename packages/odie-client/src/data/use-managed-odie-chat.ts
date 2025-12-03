import { useMutation } from '@tanstack/react-query';
import apiFetch from '@wordpress/api-fetch';
import { useCallback, useState } from 'react';
import wpcomRequest, { canAccessWpcomApis } from 'wpcom-proxy-request';
import { useOdieAssistantContext } from '../context';
import type { ReturnedChat, Message, AgentticMessage } from '../types';

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
		onSuccess,
	} );
};

/**
 * Get a full API of an Odie chat.
 * @param providedChatId - The chat ID to manage.
 */
export const useManagedOdieChat = ( providedChatId: number | null, botSlug: string ) => {
	const [ chatId, setChatId ] = useState< number | null >( providedChatId );
	const [ chatMessages, setChatMessages ] = useState< Message[] >( [] );

	const onSuccess = useCallback(
		( returnedChat: ReturnedChat ) => {
			const messages = [ ...chatMessages, ...returnedChat.messages ];
			setChatId( returnedChat.chat_id );
			setChatMessages( messages );
		},
		[ chatMessages ]
	);

	const sendOdieMessage = useSendOdieMessage( chatId ?? null, botSlug, onSuccess );

	function sendMessage( message: Message ) {
		setChatMessages( [ ...chatMessages, message ] );
		sendOdieMessage.mutateAsync( message );
	}

	return {
		messages: chatMessages.map( convertMessageToAgentticFormat ) || [],
		sendMessage,
		isProcessing: sendOdieMessage.isPending,
	};
};
