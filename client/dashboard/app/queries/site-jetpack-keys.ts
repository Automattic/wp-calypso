import { queryOptions } from '@tanstack/react-query';
import { fetchJetpackKeys } from '../../data/site-jetpack-keys';

export const siteJetpackKeysQuery = ( siteId: number ) =>
	queryOptions( {
		queryKey: [ 'site', siteId, 'jetpack_keys' ],
		queryFn: () => fetchJetpackKeys( siteId ),
		select: ( data ): { slug: string; key: string }[] => {
			const plugins: { slug: string; key: string }[] = [];
			Object.entries( data.keys ).forEach( ( [ slug, key ] ) => {
				plugins.push( { slug, key } );
			} );
			return plugins;
		},
	} );
