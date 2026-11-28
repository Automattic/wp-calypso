import { fetchSiteDataCenter } from '@automattic/api-core';
import { queryOptions } from '@tanstack/react-query';

export const siteDataCenterQuery = ( siteId: number ) =>
	queryOptions( {
		queryKey: [ 'site', siteId, 'data-center' ],
		queryFn: () => fetchSiteDataCenter( siteId ),
		// The recommendation reads two weeks of traffic, so it's slow and changes slowly.
		staleTime: 60 * 60 * 1000,
		// Older backends don't have this endpoint; callers fall back to the primary data center.
		retry: false,
	} );
