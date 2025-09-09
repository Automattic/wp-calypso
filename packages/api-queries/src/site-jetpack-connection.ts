import { fetchJetpackConnection } from '@automattic/api-core';
import { queryOptions } from '@tanstack/react-query';

export const siteJetpackConnectionQuery = ( siteId: number ) =>
	queryOptions( {
		queryKey: [ 'site', siteId, 'jetpack_connection' ],
		queryFn: () => fetchJetpackConnection( siteId ),
	} );
