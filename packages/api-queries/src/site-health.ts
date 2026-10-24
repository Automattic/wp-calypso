import { fetchSiteHealth } from '@automattic/api-core';
import { queryOptions } from '@tanstack/react-query';

export const siteHealthQuery = ( siteId: number ) =>
	queryOptions( {
		queryKey: [ 'site', siteId, 'health' ],
		queryFn: () => fetchSiteHealth( siteId ),
	} );
