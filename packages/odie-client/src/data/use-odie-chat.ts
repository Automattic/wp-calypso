import { useQuery } from '@tanstack/react-query';
import apiFetch from '@wordpress/api-fetch';
import wpcomRequest, { canAccessWpcomApis } from 'wpcom-proxy-request';
import { useOdieAssistantContext, emptyChat } from '../context';
import { Chat, ReturnedChat } from '../types';

/**
 * Get the ODIE chat and manage the cache to save on API calls.
 */
export const useOdieChat = ( chatId: number | null ) => {
	const { botNameSlug } = useOdieAssistantContext();

	return useQuery< ReturnedChat, Error, Chat >( {
		queryKey: [ 'odie-chat', botNameSlug, chatId ],
		queryFn: async (): Promise< ReturnedChat > =>
			canAccessWpcomApis()
				? await wpcomRequest( {
						method: 'GET',
						path: `/odie/chat/${ botNameSlug }/${ chatId }?page_number=1&items_per_page=30&include_feedback=true`,
						apiNamespace: 'wpcom/v2',
				  } )
				: await apiFetch( {
						path: `/help-center/odie/chat/${ botNameSlug }/${ chatId }?page_number=1&items_per_page=30&include_feedback=true`,
						method: 'GET',
				  } ),
		select: ( data: ReturnedChat ) => {
			return {
				...emptyChat,
				messages: data.messages,
				odieId: data.chat_id,
				wpcomUserId: data.wpcom_user_id,
			};
		},
		refetchOnMount: true,
		refetchOnWindowFocus: false,
		enabled: !! chatId,
		staleTime: 3600, // 1 hour
	} );
};
