import { sitePluginsQuery } from '@automattic/api-queries';
import { useQueries } from '@tanstack/react-query';
import { useMemo } from 'react';

export type EligiblePlugin = { id: string; name: string };

export function useEligiblePlugins( selectedSiteIds: string[] ) {
	const queries = useQueries( {
		queries: selectedSiteIds.map( ( id ) => sitePluginsQuery( Number( id ) ) ),
	} );

	const data = queries.map( ( query ) => query.data ).filter( Boolean );

	return useMemo< EligiblePlugin[] >( () => {
		if ( data.length === 0 ) {
			return [];
		}
		const allPlugins = data.flat();
		const unique = new Map< string, EligiblePlugin >();
		for ( const plugin of allPlugins ) {
			if ( plugin?.is_managed ) {
				continue;
			}
			const slug = plugin?.plugin?.split( '/' )[ 0 ] || plugin?.name;
			if ( slug && ! unique.has( slug ) ) {
				unique.set( slug, { id: slug, name: plugin?.name || slug } );
			}
		}
		return Array.from( unique.values() ).sort( ( a, b ) => a.name.localeCompare( b.name ) );
	}, [ data ] );
}
