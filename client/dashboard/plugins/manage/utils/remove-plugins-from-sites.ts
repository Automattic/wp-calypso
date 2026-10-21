import type { PluginListRow } from '../types';
import type { PluginsResponse } from '@automattic/api-core';

/**
 * Drop the given plugins from the sites they were removed from in a cached
 * `/me/sites/plugins` response. Used to update the shared plugins cache the
 * moment a delete succeeds, so the manager reflects the removal immediately.
 */
export function removePluginsFromSites(
	response: PluginsResponse | undefined,
	items: PluginListRow[]
): PluginsResponse | undefined {
	if ( ! response?.sites ) {
		return response;
	}

	const removedIdsBySite = new Map< number, Set< string > >();
	items.forEach( ( { id, siteIds } ) => {
		siteIds.forEach( ( siteId ) => {
			const ids = removedIdsBySite.get( siteId ) ?? new Set< string >();
			ids.add( id );
			removedIdsBySite.set( siteId, ids );
		} );
	} );

	const sites: PluginsResponse[ 'sites' ] = {};
	for ( const [ siteId, plugins ] of Object.entries( response.sites ) ) {
		const removedIds = removedIdsBySite.get( Number( siteId ) );
		sites[ siteId ] = removedIds
			? plugins.filter( ( plugin ) => ! removedIds.has( plugin.id ) )
			: plugins;
	}

	return { ...response, sites };
}
