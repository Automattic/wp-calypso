import { siteCorePluginsQuery } from '@automattic/api-queries';
import { useQueries } from '@tanstack/react-query';
import { decodeEntities } from '@wordpress/html-entities';
import { useMemo } from 'react';
import type { CorePlugin } from '@automattic/api-core';

export function useEligiblePlugins( selectedSiteIds: string[] ) {
	const queries = useQueries( {
		queries: selectedSiteIds.map( ( id ) => ( {
			...siteCorePluginsQuery( Number( id ) ),
		} ) ),
	} );

	const updatesKey = queries.map( ( query ) => String( query.dataUpdatedAt ?? 0 ) ).join( '|' );

	return useMemo< CorePlugin[] >( () => {
		const allPlugins = queries.flatMap( ( query ) => query.data ?? [] );
		if ( allPlugins.length === 0 ) {
			return [];
		}
		// Normalize to match original behavior:
		// - Ensure canonical plugin file id ends with .php
		// - Decode HTML entities in name
		// - Dedupe by normalized id
		const normalized = allPlugins
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
		// We intentionally memoize on updatesKey only; queries array identity changes every render.
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [ updatesKey ] );
}
