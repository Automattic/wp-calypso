import { siteCorePluginsQuery } from '@automattic/api-queries';
import { useQueries } from '@tanstack/react-query';
import { decodeEntities } from '@wordpress/html-entities';
import type { CorePlugin } from '@automattic/api-core';

function combinePlugins( results: { data?: CorePlugin[] }[] ): CorePlugin[] {
	const normalized = results
		.flatMap( ( query ) => query.data ?? [] )
		.filter( ( plugin ) => ! plugin.is_managed )
		.map( ( plugin ) => {
			const pluginFile = plugin.plugin;
			const canonical = pluginFile?.endsWith( '.php' ) ? pluginFile : `${ pluginFile }.php`;
			const name = plugin.name ? decodeEntities( plugin.name ) : plugin.name;
			return { ...plugin, plugin: canonical, name };
		} );

	const unique = new Map< string, CorePlugin >( normalized.map( ( p ) => [ p.plugin, p ] ) );
	return Array.from( unique.values() ).sort( ( a, b ) =>
		( a.name || a.plugin ).localeCompare( b.name || b.plugin )
	);
}

export function useEligiblePlugins( selectedSiteIds: string[] ) {
	return useQueries( {
		queries: selectedSiteIds.map( ( id ) => siteCorePluginsQuery( Number( id ) ) ),
		combine: combinePlugins,
	} );
}
