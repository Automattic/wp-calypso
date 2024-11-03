import { useQuery } from '@tanstack/react-query';
import { handleSupportInteractionsFetch } from './handle-support-interactions-fetch';
import type { SupportInteraction } from '../types/';

/**
 * Get the support interaction.
 * @returns Support interactions.
 */
export const useGetSupportInteractions = (
	per_page = 10,
	page = 1,
	status = 'open',
	provider = null
) => {
	const path = `?per_page=${ per_page }&page=${ page }&status=${ status }`;

	return useQuery( {
		queryKey: [ 'support-interactions', 'get-interactions', path ],
		queryFn: () => handleSupportInteractionsFetch( 'GET', path ) as Promise< SupportInteraction[] >,
		select: ( data: SupportInteraction[] ) => {
			if ( ! provider ) {
				return data;
			}

			return data.filter( ( interaction ) =>
				interaction.events.some( ( event ) => event.event_source === provider )
			);
		},
		refetchOnWindowFocus: false,
		refetchOnReconnect: false,
		refetchIntervalInBackground: false,
	} );
};
