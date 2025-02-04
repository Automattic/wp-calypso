import { useQuery } from '@tanstack/react-query';
import apiFetch from '@wordpress/api-fetch';
import wpcomRequest, { canAccessWpcomApis } from 'wpcom-proxy-request';
import { useOdieAssistantContext } from '../context';
import type { OdieChat, ReturnedChat } from '../types';

/**
 * Get the ODIE chat and manage the cache to save on API calls.
 */
export const useOdieChat = ( chatId: number | null ) => {
	const { botNameSlug, version } = useOdieAssistantContext();

	return useQuery< OdieChat, Error >( {
		queryKey: [ 'odie-chat', botNameSlug, chatId, version ],
		queryFn: async (): Promise< OdieChat > => {
			const queryParams = new URLSearchParams( {
				page_number: '1',
				items_per_page: '30',
				include_feedback: 'true',
				...( version && { version } ),
			} ).toString();

			const data = (
				canAccessWpcomApis()
					? await wpcomRequest( {
							method: 'GET',
							path: `/odie/chat/${ botNameSlug }/${ chatId }?${ queryParams }`,
							apiNamespace: 'wpcom/v2',
					  } )
					: await apiFetch( {
							path: `/help-center/odie/chat/${ botNameSlug }/${ chatId }?${ queryParams }`,
							method: 'GET',
					  } )
			) as ReturnedChat;

			return {
				messages: data.messages || [],
				odieId: Number( data.chat_id ) || chatId,
				wpcomUserId: data.wpcom_user_id,
			};
		},
		refetchOnMount: true,
		refetchOnWindowFocus: false,
		enabled: !! chatId,
		staleTime: 3600, // 1 hour
	} );
};
