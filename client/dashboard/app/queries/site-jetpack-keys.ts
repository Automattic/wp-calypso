import { fetchJetpackKeys } from '@automattic/api-core';
import { queryOptions } from '@tanstack/react-query';

export const siteJetpackKeysQuery = ( siteId: number ) =>
	queryOptions( {
		queryKey: [ 'site', siteId, 'jetpack_keys' ],
		queryFn: () => fetchJetpackKeys( siteId ),
	} );
