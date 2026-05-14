import { fetchSiteWordadsStatus } from '@automattic/api-core';
import { queryOptions } from '@tanstack/react-query';

export const siteWordadsStatusQuery = ( siteId: number ) =>
	queryOptions( {
		queryKey: [ 'site', siteId, 'wordads-status' ],
		queryFn: () => fetchSiteWordadsStatus( siteId ),
	} );
