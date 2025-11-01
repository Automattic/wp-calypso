import { fetchSiteRewindState } from '@automattic/api-core';
import { queryOptions } from '@tanstack/react-query';

export const siteRewindStateQuery = ( siteId: number ) =>
	queryOptions( {
		queryKey: [ 'site', siteId, 'rewind-state' ],
		queryFn: () => fetchSiteRewindState( siteId ),
	} );
