import { queryOptions } from '@tanstack/react-query';
import { fetchJetpackKeys } from '../../data/site-jetpack-keys';

export const siteJetpackKeysQuery = ( siteId: number ) =>
	queryOptions( {
		queryKey: [ 'site', siteId, 'jetpack_keys' ],
		queryFn: () => fetchJetpackKeys( siteId ),
	} );
