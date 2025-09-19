import { useQuery } from '@tanstack/react-query';
import apiFetch from '@wordpress/api-fetch';
import wpcomRequest, { canAccessWpcomApis } from 'wpcom-proxy-request';
import { useOdieAssistantContext } from '../context';
import { getTimestamp } from '../utils';
import type { OdieConversation } from '../types';

/**
 * Retrieves the list of conversations handled by AI.
 */
export const useGetOdieConversations = ( enabled = true ) => {
	const { botNameSlug, version } = useOdieAssistantContext();

	return useQuery< OdieConversation[], Error >( {
		queryKey: [ 'odie-interactions', botNameSlug, version ],
		queryFn: async (): Promise< OdieConversation[] > => {
			const queryParams = new URLSearchParams( {
				page_number: '1',
				items_per_page: '30',
				truncation_method: 'first_message',
			} ).toString();

			const response: any[] = canAccessWpcomApis()
				? await wpcomRequest( {
						method: 'GET',
						path: `/odie/conversations/${ botNameSlug }?${ queryParams }`,
						apiNamespace: 'wpcom/v2',
				  } )
				: await apiFetch( {
						path: `/help-center/odie/conversations/${ botNameSlug }?${ queryParams }`,
						method: 'GET',
				  } );

			return response.map( ( conversation: any ) => {
				const summary = conversation.first_message ?? conversation.last_message;
				return {
					id: String( conversation.chat_id ?? '' ),
					createdAt: getTimestamp( conversation.created_at ),
					messages: summary
						? [
								{
									received: getTimestamp( summary.created_at ),
									role: summary.role ?? 'bot',
									text: summary.content ?? '',
								},
						  ]
						: [],
				};
			} ) as OdieConversation[];
		},
		refetchOnMount: true,
		refetchOnWindowFocus: false,
		enabled,
		staleTime: 1000 * 30, // 30 seconds
	} );
};
