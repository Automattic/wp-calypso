import { jetpackTestConnectionQuery } from '@automattic/api-queries';
import { useQueries } from '@tanstack/react-query';
import type { SitesWithWooPaymentsState } from '../../types';

export type SiteTestConnection = {
	ID: number;
	connected: boolean;
};

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
