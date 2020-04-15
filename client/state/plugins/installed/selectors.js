/**
 * External dependencies
 */

import { every, filter, find, get, pick, reduce, some, sortBy, values } from 'lodash';

/**
 * Internal dependencies
 */
import {
	getSite,
	getSiteTitle,
	isJetpackSite,
	isJetpackSiteSecondaryNetworkSite,
} from 'state/sites/selectors';

const _filters = {
	none: function () {
		return false;
	},
	all: function () {
		return true;
	},
	active: function ( plugin ) {
		return some( plugin.sites, function ( site ) {
			return site.active;
		} );
	},
	inactive: function ( plugin ) {
		return some( plugin.sites, function ( site ) {
			return ! site.active;
		} );
	},
	updates: function ( plugin ) {
		return some( plugin.sites, function ( site ) {
			return site.update;
		} );
	},
	isEqual: function ( pluginSlug, plugin ) {
		return plugin.slug === pluginSlug;
	},
};

export function isRequesting( state, siteId ) {
	if ( typeof state.plugins.installed.isRequesting[ siteId ] === 'undefined' ) {
		return false;
	}
	return state.plugins.installed.isRequesting[ siteId ];
}

export function isLoaded( state, siteId ) {
	return false === state.plugins.installed.isRequesting[ siteId ];
}

export function isRequestingForSites( state, sites ) {
	// As long as any sites have isRequesting true, we consider this group requesting
	return some( sites, ( siteId ) => isRequesting( state, siteId ) );
}

export function getPlugins( state, siteIds, pluginFilter ) {
	let pluginList = reduce(
		siteIds,
		( memo, siteId ) => {
			const list = state.plugins.installed.plugins[ siteId ] || [];
			list.forEach( ( item ) => {
				const sitePluginInfo = pick( item, [ 'active', 'autoupdate', 'update' ] );
				if ( memo[ item.slug ] ) {
					memo[ item.slug ].sites = {
						...memo[ item.slug ].sites,
						[ siteId ]: sitePluginInfo,
					};
				} else {
					memo[ item.slug ] = { ...item, sites: { [ siteId ]: sitePluginInfo } };
				}
			} );
			return memo;
		},
		{}
	);

	if ( pluginFilter && _filters[ pluginFilter ] ) {
		pluginList = filter( pluginList, _filters[ pluginFilter ] );
	}
	return values( sortBy( pluginList, ( item ) => item.slug.toLowerCase() ) );
}

export function getPluginsWithUpdates( state, siteIds ) {
	return filter( getPlugins( state, siteIds ), _filters.updates ).map( ( plugin ) => ( {
		...plugin,
		version: plugin?.update?.new_version,
		type: 'plugin',
	} ) );
}

export function getPluginOnSite( state, siteId, pluginSlug ) {
	const pluginList = getPlugins( state, [ siteId ] );
	return find( pluginList, { slug: pluginSlug } );
}

export function getSitesWithPlugin( state, siteIds, pluginSlug ) {
	const pluginList = getPlugins( state, siteIds );
	const plugin = find( pluginList, { slug: pluginSlug } );
	if ( ! plugin ) {
		return [];
	}

	// Filter the requested sites list by the list of sites for this plugin
	const pluginSites = filter( siteIds, ( siteId ) => {
		return plugin.sites.hasOwnProperty( siteId );
	} );

	return sortBy( pluginSites, ( siteId ) => getSiteTitle( state, siteId ).toLowerCase() );
}

export function getSitesWithoutPlugin( state, siteIds, pluginSlug ) {
	const installedOnSiteIds = getSitesWithPlugin( state, siteIds, pluginSlug ) || [];
	return filter( siteIds, function ( siteId ) {
		if ( ! get( getSite( state, siteId ), 'visible' ) || ! isJetpackSite( state, siteId ) ) {
			return false;
		}

		if ( isJetpackSiteSecondaryNetworkSite( state, siteId ) ) {
			return false;
		}

		return every( installedOnSiteIds, function ( installedOnSiteId ) {
			return installedOnSiteId !== siteId;
		} );
	} );
}

export function getStatusForPlugin( state, siteId, pluginId ) {
	if ( typeof state.plugins.installed.status[ siteId ] === 'undefined' ) {
		return false;
	}
	if ( typeof state.plugins.installed.status[ siteId ][ pluginId ] === 'undefined' ) {
		return false;
	}
	const status = state.plugins.installed.status[ siteId ][ pluginId ];
	return Object.assign( {}, status, { siteId: siteId, pluginId: pluginId } );
}

export function getStatusForSite( state, siteId ) {
	if ( typeof state.plugins.installed.status[ siteId ] === 'undefined' ) {
		return false;
	}
	return state.plugins.installed.status[ siteId ];
}

export function isPluginDoingAction( state, siteId, pluginId ) {
	const status = getStatusForPlugin( state, siteId, pluginId );
	return !! status && 'inProgress' === status.status;
}
