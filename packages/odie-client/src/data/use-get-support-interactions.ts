import { useQuery } from '@tanstack/react-query';
import { handleSupportInteractionsFetch } from './handle-support-interactions-fetch';
import type { SupportProvider } from '../types';

/**
 * Get the support interactions.
 * @returns Support interactions.
 */
export const useGetSupportInteractions = (
	provider: SupportProvider | null = null,
	per_page = 10,
	status: string | string[] = 'open',
	page = 1,
	enabled = true,
	freshness = 0
) => {
	const path = `?per_page=${ per_page }&page=${ page }&status=${ status }`;
	return useQuery( {
		// eslint-disable-next-line
		queryKey: [ 'support-interactions', 'get-interactions', provider, status, freshness ],
		queryFn: async () => {
			const response = await handleSupportInteractionsFetch( 'GET', path );

			if ( response.length === 0 ) {
				return null;
			}

			if ( provider ) {
				return response.filter( ( interaction ) =>
					interaction.events.some( ( event ) => event.event_source === provider )
				);
			}

			return response;
		},
		enabled,
		staleTime: 1000 * 30, // 30 seconds
	} );
};
