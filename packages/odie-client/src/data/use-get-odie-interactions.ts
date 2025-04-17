import { useQuery } from '@tanstack/react-query';
import apiFetch from '@wordpress/api-fetch';
import wpcomRequest, { canAccessWpcomApis } from 'wpcom-proxy-request';
import { useOdieAssistantContext } from '../context';
import type { ReturnedChat } from '../types';

/**
 * Get the Odie interactions and manage the cache to save on API calls.
 */
export const useGetOdieInteractions = ( enabled = true ) => {
	const { botNameSlug, version } = useOdieAssistantContext();

	return useQuery< ReturnedChat[], Error >( {
		queryKey: [ 'odie-interactions', botNameSlug, version ],
		queryFn: async (): Promise< ReturnedChat[] > => {
			const queryParams = new URLSearchParams( {
				page_number: '1',
				items_per_page: '30',
			} ).toString();

			const data = (
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
			) as ReturnedChat[];

			return data;
		},
		refetchOnMount: true,
		refetchOnWindowFocus: false,
		enabled,
		staleTime: 3600, // 1 hour
	} );
};
