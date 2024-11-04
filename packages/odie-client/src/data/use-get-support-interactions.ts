import { useQuery } from '@tanstack/react-query';
import { handleSupportInteractionsFetch } from './handle-support-interactions-fetch';
import type { SupportInteraction, SupportProvider } from '../types/';

/**
 * Get the support interactions.
 * @returns Support interactions.
 */
export const useGetSupportInteractions = (
	provider: SupportProvider | null = null,
	per_page = 10,
	status = 'open',
	page = 1
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
				interaction.events.some( ( event ) => event.source === provider )
			);
		},
		refetchOnWindowFocus: false,
		refetchOnReconnect: false,
		refetchIntervalInBackground: false,
	} );
};
