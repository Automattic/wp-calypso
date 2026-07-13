import { jetpackTestConnectionQuery } from '@automattic/api-queries';
import { useQueries } from '@tanstack/react-query';
import type { SitesWithWooPaymentsState } from '../../types';

export type SiteTestConnection = {
	ID: number;
	connected: boolean;
};

// Fetches the Jetpack connection status for each site in parallel and maps it
// back onto the site's blog id, defaulting to connected when a result is missing.
export const useTestConnections = ( sites: SitesWithWooPaymentsState[] ): SiteTestConnection[] => {
	const connectedResults = useQueries( {
		queries: sites.map( ( site ) => ( {
			...jetpackTestConnectionQuery( site.blogId ?? 0, true ),
			staleTime: 1000 * 60,
			enabled: sites.length > 0,
		} ) ),
		combine: ( results ) => results.map( ( result ) => result.data?.connected ?? true ),
	} );

	return sites.map( ( site, index ) => ( {
		ID: site.blogId,
		connected: connectedResults[ index ] ?? true,
	} ) );
};
