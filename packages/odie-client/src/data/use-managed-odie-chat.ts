import { useMutation, useQueryClient } from '@tanstack/react-query';
import apiFetch from '@wordpress/api-fetch';
import { useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import wpcomRequest, { canAccessWpcomApis } from 'wpcom-proxy-request';
import { useOdieAssistantContext } from '../context';
import { getOdieIdFromInteraction } from '../utils';
import { useCurrentSupportInteraction } from './use-current-support-interaction';
import { useManageSupportInteraction } from './use-manage-support-interaction';
import { useOdieChat } from './use-odie-chat';
import type { ReturnedChat, Message, OdieChat, SupportInteraction } from '../types';
import type { Message as AgentticMessage } from '@automattic/agenttic-ui/dist/types';

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
 * @returns useMutation return object.
 */
export const useSendOdieMessage = () => {
	const { selectedSiteId, version, newInteractionsBotSlug } = useOdieAssistantContext();
	const {
		data: currentSupportInteraction,
		promise: currentSupportInteractionPromise,
		isFetching: isFetchingCurrentSupportInteraction,
	} = useCurrentSupportInteraction();
	const botSlug = currentSupportInteraction?.bot_slug || newInteractionsBotSlug;
	const chatId = getOdieIdFromInteraction( currentSupportInteraction );
	const { startNewInteraction } = useManageSupportInteraction();

	const queryClient = useQueryClient();

	return useMutation< { chat: ReturnedChat; interaction: SupportInteraction }, Error, Message >( {
		mutationFn: async ( message: Message ) => {
			const chatIdSegment = chatId ? `/${ chatId }` : '';
			const url = window.location.href;
			const pathname = window.location.pathname;
			let interaction = currentSupportInteraction;

			// This prevents a race condition where the current support interaction is not fetched yet.
			if ( isFetchingCurrentSupportInteraction ) {
				interaction = await currentSupportInteractionPromise;
			}

			const chat = await ( canAccessWpcomApis()
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
				  } ) );

			if ( ! interaction ) {
				interaction = await startNewInteraction( {
					event_source: 'odie',
					event_external_id: chat.chat_id.toString(),
				} );
			}

			return { chat, interaction };
		},
		onMutate( message: Message ) {
			queryClient.setQueryData(
				[ 'odie-chat', botSlug, chatId ? Number( chatId ) : undefined, version ],
				( currentChatCache: OdieChat ) => {
					return {
						...currentChatCache,
						messages: [ ...( currentChatCache?.messages ?? [] ), message ],
					};
				}
			);
		},
		onSuccess( data ) {
			queryClient.setQueryData(
				[ 'odie-chat', botSlug, data.chat.chat_id, version ],
				( currentChatCache: OdieChat ) => {
					return {
						...currentChatCache,
						messages: [ ...( currentChatCache?.messages ?? [] ), ...data.chat.messages ],
					};
				}
			);
		},
		onError() {
			// handle errors gracefully.
		},
	} );
};

/**
 * Get a full API of an Odie chat.
 */
export const useManagedOdieChat = () => {
	const [ initialMessage, setInitialMessage ] = useState< AgentticMessage | null >( null );
	const { data: currentSupportInteraction } = useCurrentSupportInteraction();
	const { version, newInteractionsBotSlug } = useOdieAssistantContext();
	const chatId = getOdieIdFromInteraction( currentSupportInteraction );
	const botSlug = currentSupportInteraction?.bot_slug || newInteractionsBotSlug;
	const queryClient = useQueryClient();
	const {
		data: chat,
		isFetching: isFetchingChat,
		isPending: isPendingChat, // Fast loading: enables instant loading state
	} = useOdieChat( chatId ? Number( chatId ) : null );
	const navigate = useNavigate();
	// Fast loading: instantly determine if this is a new chat for UI responsiveness
	const [ searchParams ] = useSearchParams();
	const isNewChat = ! searchParams.get( 'odieInteractionId' );

	const sendOdieMessage = useSendOdieMessage();

	async function sendMessage( message: string ) {
		const odieMessage = convertMessageFromAgentticFormat( message );

		// Show initial message for new chats
		if ( isNewChat ) {
			setInitialMessage( convertMessageToAgentticFormat( odieMessage ) );
		}

		try {
			const { interaction, chat: responseChat } = await sendOdieMessage.mutateAsync( odieMessage );

			if ( interaction.uuid !== currentSupportInteraction?.uuid ) {
				// Set the new chat data with user's message prepended
				queryClient.setQueryData( [ 'odie-chat', botSlug, responseChat.chat_id, version ], {
					chat_id: responseChat.chat_id,
					messages: [ odieMessage, ...responseChat.messages ],
				} );

				navigate( `/odie?odieInteractionId=${ interaction.uuid }`, { replace: true } );
			}
		} catch ( error ) {
			// eslint-disable-next-line no-console
			console.error( '[useManagedOdieChat] Failed to send message:', error );
		} finally {
			// Clear initial message
			setInitialMessage( null );
		}
	}

	// Combine loaded messages with initial message
	const messages = useMemo(
		() => [
			...( chat?.messages ?? [] ).map( convertMessageToAgentticFormat ),
			...( initialMessage ? [ initialMessage ] : [] ),
		],
		[ chat?.messages, initialMessage ]
	);

	return {
		messages,
		sendMessage,
		isProcessing: sendOdieMessage.isPending || isFetchingChat,
		// Fast loading: only show spinner for existing chats, never for new chat creation
		isLoadingChat: ! isNewChat && isPendingChat,
	};
};
