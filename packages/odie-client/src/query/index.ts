import { useMutation, UseMutationResult, useQuery, useQueryClient } from '@tanstack/react-query';
import apiFetch from '@wordpress/api-fetch';
import { useI18n } from '@wordpress/react-i18n';
import { useRef } from 'react';
import { canAccessWpcomApis } from 'wpcom-proxy-request';
// eslint-disable-next-line no-restricted-imports
import wpcom from 'calypso/lib/wp';
import { useOdieAssistantContext } from '../context';
import { broadcastOdieMessage, useSetOdieStorage } from '../data';
import type { Chat, Message, MessageRole, MessageType, OdieAllowedBots } from '../types/';

// Either we use wpcom or apiFetch for the request for accessing odie endpoint for atomic or wpcom sites
const buildSendChatMessage = async (
	message: Message,
	botNameSlug: OdieAllowedBots,
	chat_id?: number | null,
	version?: string | null,
	selectedSiteId?: number | null
) => {
	const baseApiPath = '/help-center/odie/chat/';
	const wpcomBaseApiPath = '/odie/chat/';

	const apiPathWithIds =
		chat_id !== null && chat_id !== undefined
			? `${ baseApiPath }${ botNameSlug }/${ chat_id }`
			: `${ baseApiPath }${ botNameSlug }`;

	const wpcomApiPathWithIds =
		chat_id !== null && chat_id !== undefined
			? `${ wpcomBaseApiPath }${ botNameSlug }/${ chat_id }`
			: `${ wpcomBaseApiPath }${ botNameSlug }`;

	return canAccessWpcomApis()
		? odieWpcomSendSupportMessage( message, wpcomApiPathWithIds, version, selectedSiteId )
		: apiFetch( {
				path: apiPathWithIds,
				method: 'POST',
				data: { message: message.content, version, context: { selectedSiteId } },
		  } );
};

function odieWpcomSendSupportMessage(
	message: Message,
	path: string,
	version?: string | null,
	selectedSiteId?: number | null
) {
	return wpcom.req.post( {
		path,
		apiNamespace: 'wpcom/v2',
		body: { message: message.content, version, context: { selectedSiteId } },
	} );
}

// Internal helper function to generate a uuid
export const uuid = () => {
	return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace( /[xy]/g, function ( c ) {
		const r = ( Math.random() * 16 ) | 0;
		const v = c === 'x' ? r : ( r & 0x3 ) | 0x8;
		return v.toString( 16 );
	} );
};

/**
 * It will post a new message using the current chat_id.
 * The message object should be in the format of Message type. The mutator will take
 * care of adding placeholders and error messages to the chat.
 * @returns UseMutationResult
 * @example
 * const { mutate, isLoading } = useOdieSendMessage();
 * mutate( { message: { content: 'Hello' } } );
 */
export const useOdieSendMessage = (): UseMutationResult<
	{ chat_id: string; messages: Message[] },
	unknown,
	{ message: Message },
	{ internal_message_id: string }
> => {
	const {
		chat,
		botNameSlug,
		setIsLoading,
		setChat,
		updateMessage,
		odieClientId,
		selectedSiteId,
		version,
	} = useOdieAssistantContext();
	const queryClient = useQueryClient();
	const userMessage = useRef< Message | null >( null );
	const storeChatId = useSetOdieStorage( 'chat_id' );
	const { __ } = useI18n();

	/* translators: Error message when Wapuu fails to send a message */
	const wapuuErrorMessage = __(
		"Wapuu oopsie! 😺 I'm in snooze mode and can't chat just now. Don't fret, just browse through the buttons below to connect with WordPress.com support.",
		__i18n_text_domain__
	);

	/* translators: Error message when Wapuu user's exceed free messages limit */
	const wapuuRateLimitMessage = __(
		"Hi there! You've hit your AI usage limit. Upgrade your plan for unlimited Wapuu support! You can still get user support using the buttons below.",
		__i18n_text_domain__
	);

	return useMutation<
		{ chat_id: string; messages: Message[] },
		{ data: { status: number; messages: Message[] } },
		{ message: Message },
		{ internal_message_id: string }
	>( {
		mutationFn: ( { message }: { message: Message } ) => {
			broadcastOdieMessage( message, odieClientId );
			return buildSendChatMessage(
				{ ...message },
				botNameSlug,
				chat.chat_id,
				version,
				selectedSiteId
			);
		},
		onMutate: ( { message } ) => {
			const internal_message_id = uuid();
			const messages = [
				message,
				{
					internal_message_id,
					content: '...',
					role: 'bot' as MessageRole,
					type: 'placeholder' as MessageType,
				},
			];

			setChat( ( prevChat: Chat ) => {
				// Normalize message to always be an array
				const newMessages = messages;

				// Filter out 'placeholder' messages if new message is not 'dislike-feedback'
				const filteredMessages = newMessages.some( ( msg ) => msg.type === 'dislike-feedback' )
					? prevChat.messages
					: prevChat.messages.filter( ( msg ) => msg.type !== 'placeholder' );

				// Append new messages at the end
				return {
					chat_id: prevChat.chat_id,
					messages: [ ...filteredMessages, ...newMessages ],
				};
			} );
			setIsLoading( true );
			userMessage.current = message;

			return { internal_message_id };
		},
		onSuccess: ( data, _, context ) => {
			if ( ! context ) {
				throw new Error( 'Context is undefined' );
			}
			const { internal_message_id } = context;

			if ( ! data.messages || ! data.messages[ 0 ].content ) {
				const message = {
					content: wapuuErrorMessage,
					internal_message_id,
					role: 'bot',
					type: 'error',
				} as Message;

				updateMessage( message );
				broadcastOdieMessage( message, odieClientId );

				return;
			}
			const message = {
				message_id: data.messages[ 0 ].message_id,
				internal_message_id,
				content: data.messages[ 0 ].content,
				role: 'bot',
				simulateTyping: data.messages[ 0 ].simulateTyping,
				type: 'message',
				context: data.messages[ 0 ].context,
			} as Message;
			updateMessage( message );

			broadcastOdieMessage( message, odieClientId );
			storeChatId( data.chat_id );
			const queryKey = [ 'chat', botNameSlug, data.chat_id, 1, 30, true ];

			queryClient.setQueryData( queryKey, ( currentChatCache: Chat ) => {
				if ( ! currentChatCache ) {
					return {
						chat_id: data.chat_id,
						messages: [ userMessage.current, message ],
					};
				}

				return {
					...currentChatCache,
					messages: [
						...currentChatCache.messages,
						userMessage.current,
						{ ...message, simulateTyping: false },
					],
				};
			} );
		},
		onSettled: () => {
			setIsLoading( false );
		},
		onError: ( response, __, context ) => {
			if ( ! context ) {
				throw new Error( 'Context is undefined' );
			}

			const isRateLimitError =
				response && response.data && response.data.status === 429 ? true : false;

			const { internal_message_id } = context;
			const message = {
				content: isRateLimitError ? wapuuRateLimitMessage : wapuuErrorMessage,
				internal_message_id,
				role: 'bot',
				type: 'error',
			} as Message;
			updateMessage( message );

			broadcastOdieMessage( message, odieClientId );
		},
	} );
};

const buildGetChatMessage = (
	botNameSlug: OdieAllowedBots,
	chat_id: number | null | undefined,
	page: number,
	perPage: number,
	includeFeedback: boolean
): Promise< Chat > => {
	const urlQueryParams = new URLSearchParams( {
		page_number: page.toString(),
		items_per_page: perPage.toString(),
		include_feedback: includeFeedback.toString(),
	} );
	const baseApiPath = `/help-center/odie/chat/${ botNameSlug }/${ chat_id }?${ urlQueryParams.toString() }`;
	const wpcomBaseApiPath = `/odie/chat/${ botNameSlug }/${ chat_id }?${ urlQueryParams.toString() }`;

	return canAccessWpcomApis()
		? odieWpcomGetChat( wpcomBaseApiPath )
		: ( apiFetch( {
				path: baseApiPath,
				method: 'GET',
		  } ) as Promise< Chat > );
};

function odieWpcomGetChat( path: string ): Promise< Chat > {
	return wpcom.req.get( {
		path,
		apiNamespace: 'wpcom/v2',
	} ) as Promise< Chat >;
}

/**
 * It will get the chat messages using the current chat_id.
 * @returns UseQueryResult
 * @example
 * const { data, isLoading } = useOdieGetChat();
 */
export const useOdieGetChat = (
	botNameSlug: OdieAllowedBots,
	chatId: number | undefined | null,
	page = 1,
	perPage = 10,
	includeFeedback = true
) => {
	const { chat } = useOdieAssistantContext();
	return useQuery< Chat, unknown >( {
		queryKey: [ 'chat', botNameSlug, chatId, page, perPage, includeFeedback ],
		queryFn: () => buildGetChatMessage( botNameSlug, chatId, page, perPage, includeFeedback ),
		refetchOnWindowFocus: false,
		enabled: !! chatId && ! chat.chat_id,
	} );
};

const odieWpcomSendMessageFeedback = (
	botNameSlug: OdieAllowedBots,
	chatId: number,
	messageId: number,
	rating_value: number
) => {
	const path = `/odie/chat/${ botNameSlug }/${ chatId }/${ messageId }/feedback`;

	return wpcom.req.post( {
		path,
		apiNamespace: 'wpcom/v2',
		body: { rating_value },
	} );
};

/**
 * It will post a new message using the current chat_id.
 * This mutator is intended to shend feedback (thumbs up or down) for a message.
 * @returns UseMutationResult
 * @example
 * const { mutate, isLoading } = useOdieSendMessageFeedback();
 * mutate( { rating_value: 1, message: { message_id: 123 } } );
 */
export const useOdieSendMessageFeedback = (): UseMutationResult<
	number,
	unknown,
	{ rating_value: number; message: Message }
> => {
	const { chat, botNameSlug } = useOdieAssistantContext();
	const queryClient = useQueryClient();

	return useMutation( {
		mutationFn: ( { rating_value, message }: { rating_value: number; message: Message } ) => {
			return odieWpcomSendMessageFeedback(
				botNameSlug,
				chat.chat_id || 0,
				message.message_id || 0,
				rating_value
			);
		},
		onSuccess: ( _, { rating_value, message } ) => {
			const queryKey = [ 'chat', botNameSlug, chat.chat_id, 1, 30, true ];

			queryClient.setQueryData( queryKey, ( currentChatCache: Chat ) => {
				if ( ! currentChatCache ) {
					return;
				}

				return {
					...currentChatCache,
					messages: currentChatCache.messages.map( ( m ) =>
						m.internal_message_id === message.internal_message_id ? { ...m, rating_value } : m
					),
				};
			} );
		},
	} );
};
