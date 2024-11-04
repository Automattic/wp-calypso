import { useQuery, useQueryClient } from '@tanstack/react-query';
import apiFetch from '@wordpress/api-fetch';
import wpcomRequest, { canAccessWpcomApis } from 'wpcom-proxy-request';
import { useOdieAssistantContext } from '../context';
import { useGetOdieStorage } from '../data';
import { Message, Chat } from '../types/';

/**
 * Get the ODIE chat and manage the cache to save on API calls.
 */
export const useOdieChat = (
	page = 1,
	perPage = 30,
	includeFeedback = true
): {
	chat: Chat | undefined;
	updateCache: ( messages: Message[] ) => void;
} => {
	const chatId = useGetOdieStorage( 'chat_id' ) || 0;
	const queryClient = useQueryClient();
	const { botNameSlug } = useOdieAssistantContext();

	const urlQueryParams = new URLSearchParams( {
		page_number: page.toString(),
		items_per_page: perPage.toString(),
		include_feedback: includeFeedback.toString(),
	} );

	const queryKey = [ 'chat', botNameSlug, chatId, page, perPage, includeFeedback ];

	const { data: chat } = useQuery< Chat, Error >( {
		queryKey: queryKey,
		queryFn: async (): Promise< Chat > => {
			const response: Chat = canAccessWpcomApis()
				? await wpcomRequest( {
						method: 'GET',
						path: `/odie/chat/${ botNameSlug }/${ chatId }?${ urlQueryParams.toString() }`,
						apiNamespace: 'wpcom/v2',
				  } )
				: await apiFetch( {
						path: `/help-center/odie/chat/${ botNameSlug }/${ chatId }?${ urlQueryParams.toString() }`,
						method: 'GET',
				  } );

			// Ensure the response matches the Chat type
			const chatResponse: Chat = {
				chat_id: response.chat_id,
				messages: response.messages || [],
				wpcom_user_id: response.wpcom_user_id,
				// Add any other fields that are part of the Chat type
			};

			return chatResponse;
		},
		refetchOnWindowFocus: false,
		enabled: !! chatId,
		// 4 hours (we update the messages when a new message is sent, so cache is not stale while we are chatting)
		staleTime: 4 * 60 * 60 * 1000,
	} );

	const updateCache = ( messages: Message[] ) => {
		queryClient.setQueryData< Chat >( queryKey, ( currentChatCache ) => {
			if ( ! currentChatCache ) {
				return {
					chat_id: Number( chatId ),
					messages,
				};
			}

			return {
				...currentChatCache,
				messages: [ ...currentChatCache.messages, ...messages ],
			};
		} );
	};

	return { chat, updateCache };
};
