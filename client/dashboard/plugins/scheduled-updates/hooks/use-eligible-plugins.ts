import { sitePluginsQuery } from '@automattic/api-queries';
import { useQueries } from '@tanstack/react-query';
import { useMemo } from 'react';
import type { SitePlugin } from '@automattic/api-core';

export function useEligiblePlugins( selectedSiteIds: string[] ) {
	const queries = useQueries( {
		queries: selectedSiteIds.map( ( id ) => ( {
			...sitePluginsQuery( Number( id ) ),
			select: ( plugins: SitePlugin[] ) => plugins.filter( ( plugin ) => ! plugin.is_managed ),
		} ) ),
	} );

	const updatesKey = queries.map( ( query ) => String( query.dataUpdatedAt ?? 0 ) ).join( '|' );

	return useMemo< SitePlugin[] >( () => {
		const allPlugins = queries.flatMap( ( query ) => query.data ?? [] );
		if ( allPlugins.length === 0 ) {
			return [];
		}
		const unique = new Map< string, SitePlugin >(
			allPlugins.map( ( plugin ) => [ plugin.slug, plugin ] )
		);
		return Array.from( unique.values() ).sort( ( a, b ) =>
			( a.name || a.slug ).localeCompare( b.name || b.slug )
		);
		// We intentionally memoize on updatesKey only; queries array identity changes every render.
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [ updatesKey ] );
}
