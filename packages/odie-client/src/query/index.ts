import { useMutation, UseMutationResult, useQuery, useQueryClient } from '@tanstack/react-query';
import apiFetch from '@wordpress/api-fetch';
import { useRef } from 'react';
import { canAccessWpcomApis } from 'wpcom-proxy-request';
// eslint-disable-next-line no-restricted-imports
import wpcom from 'calypso/lib/wp';
import { WAPUU_ERROR_MESSAGE } from '..';
import { useOdieAssistantContext } from '../context';
import { broadcastOdieMessage, setOdieStorage } from '../data';
import type { Chat, Message, OdieAllowedBots } from '../types';

// Either we use wpcom or apiFetch for the request for accessing odie endpoint for atomic or wpcom sites
const buildSendChatMessage = async (
	message: Message,
	botNameSlug: OdieAllowedBots,
	chat_id?: number | null,
	version?: string | null
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
		? odieWpcomSendSupportMessage( message, wpcomApiPathWithIds, version )
		: apiFetch( {
				path: apiPathWithIds,
				method: 'POST',
				data: { message, version },
		  } );
};

function odieWpcomSendSupportMessage( message: Message, path: string, version?: string | null ) {
	return wpcom.req.post( {
		path,
		apiNamespace: 'wpcom/v2',
		body: { message: message.content, version },
	} );
}

// Internal helper function to generate a uuid
function uuid() {
	return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace( /[xy]/g, function ( c ) {
		const r = ( Math.random() * 16 ) | 0;
		const v = c === 'x' ? r : ( r & 0x3 ) | 0x8;
		return v.toString( 16 );
	} );
}

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
	const { chat, botNameSlug, setIsLoading, addMessage, updateMessage, odieClientId, version } =
		useOdieAssistantContext();
	const queryClient = useQueryClient();
	const userMessage = useRef< Message | null >( null );

	return useMutation<
		{ chat_id: string; messages: Message[] },
		unknown,
		{ message: Message },
		{ internal_message_id: string }
	>( {
		mutationFn: ( { message }: { message: Message } ) => {
			broadcastOdieMessage( message, odieClientId );
			return buildSendChatMessage( { ...message }, botNameSlug, chat.chat_id, version );
		},
		onMutate: ( { message } ) => {
			const internal_message_id = uuid();
			addMessage( [
				message,
				{
					internal_message_id,
					content: '...',
					role: 'bot',
					type: 'placeholder',
				},
			] );
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
					content: WAPUU_ERROR_MESSAGE,
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
			setOdieStorage( 'chat_id', data.chat_id );
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
		onError: ( _, __, context ) => {
			if ( ! context ) {
				throw new Error( 'Context is undefined' );
			}
			const { internal_message_id } = context;
			const message = {
				content: WAPUU_ERROR_MESSAGE,
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
