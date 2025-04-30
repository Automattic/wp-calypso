import { useQuery } from '@tanstack/react-query';
import apiFetch from '@wordpress/api-fetch';
import wpcomRequest, { canAccessWpcomApis } from 'wpcom-proxy-request';
import { useOdieAssistantContext } from '../context';
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
			} ).toString();

			return (
				canAccessWpcomApis()
					? await wpcomRequest( {
							method: 'GET',
							path: `/odie/chats/${ botNameSlug }?${ queryParams }`,
							apiNamespace: 'wpcom/v2',
					  } )
					: await apiFetch( {
							path: `/help-center/odie/chats/${ botNameSlug }?${ queryParams }`,
							method: 'GET',
					  } )
			) as OdieConversation[];
		},
		refetchOnMount: true,
		refetchOnWindowFocus: false,
		enabled,
		staleTime: 3600, // 1 hour
	} );
};
