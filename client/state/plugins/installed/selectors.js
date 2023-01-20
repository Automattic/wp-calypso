import { createSelector } from '@automattic/state-utils';
import { filter, find, get, pick, some, sortBy } from 'lodash';
import {
	getSite,
	getSiteTitle,
	isJetpackSite,
	isJetpackSiteSecondaryNetworkSite,
} from 'calypso/state/sites/selectors';

import 'calypso/state/plugins/init';

const _filters = {
	none: function () {
		return false;
	},
	all: function () {
		return true;
	},
	active: function ( plugin ) {
		return (
			some( plugin.sites, function ( site ) {
				return site.active;
			} ) || plugin.statusRecentlyChanged
		);
	},
	inactive: function ( plugin ) {
		return (
			some( plugin.sites, function ( site ) {
				return ! site.active;
			} ) || plugin.statusRecentlyChanged
		);
	},
	updates: function ( plugin ) {
		return (
			some( plugin.sites, function ( site ) {
				return site.update && ! site.update.recentlyUpdated;
			} ) || plugin.statusRecentlyChanged
		);
	},
	isEqual: function ( pluginSlug, plugin ) {
		return plugin.slug === pluginSlug;
	},
};

export function isEqualSlugOrId( pluginSlug, plugin ) {
	return plugin.slug === pluginSlug || plugin?.id?.split( '/' ).shift() === pluginSlug;
}

export function isRequesting( state, siteId ) {
	if ( typeof state.plugins.installed.isRequesting[ siteId ] === 'undefined' ) {
		return false;
	}
	return state.plugins.installed.isRequesting[ siteId ];
}

export function isRequestingForSites( state, sites ) {
	// As long as any sites have isRequesting true, we consider this group requesting
	return some( sites, ( siteId ) => isRequesting( state, siteId ) );
}

export function isRequestingForAllSites( state ) {
	return state.plugins.installed.isRequestingAll;
}

export function requestPluginsError( state ) {
	return state.plugins.installed.requestError;
}

const getSiteIdsWithPlugins = createSelector(
	( state ) => {
		return Object.keys( state.plugins.installed.plugins ).map( ( pluginId ) => Number( pluginId ) );
	},
	( state ) => [ state.plugins.installed.plugins ]
);

/**
 * The server returns plugins store at state.plugins.installed.plugins are indexed by site, which means
 * that the information for a plugin may be spread across multiple site objects. This selector transforms
 * that structure into one indexed by the plugin slugs and memoizes that structure.
 */
export const getAllPlugins = createSelector(
	( state ) => {
		return getSiteIdsWithPlugins( state ).reduce( ( plugins, siteId ) => {
			const pluginsForSite = state.plugins.installed.plugins[ siteId ] || [];
			pluginsForSite.forEach( ( plugin ) => {
				const sitePluginInfo = pick( plugin, [ 'active', 'autoupdate', 'update', 'version' ] );

				plugins[ plugin.slug ] = {
					...plugins[ plugin.slug ],
					...plugin,
					sites: {
						...plugins[ plugin.slug ]?.sites,
						[ siteId ]: sitePluginInfo,
					},
				};
			} );
			return plugins;
		}, {} );
	},
	( state ) => [ getSiteIdsWithPlugins( state ) ]
);

export const getFilteredAndSortedPlugins = createSelector(
	( state, siteIds, pluginFilter ) => {
		if ( isRequestingForAllSites( state ) ) {
			return [];
		}

		const allPlugins = getAllPlugins( state );

		const allPluginsForSites = Object.values( allPlugins ).filter(
			( plugin ) =>
				!! Object.keys( plugin.sites )
					.map( ( siteId ) => Number( siteId ) )
					.find( ( siteId ) => ! isRequesting( state, siteId ) && siteIds.includes( siteId ) )
		);

		const pluginList =
			pluginFilter && _filters[ pluginFilter ]
				? filter( allPluginsForSites, _filters[ pluginFilter ] )
				: allPluginsForSites;

		return sortBy( pluginList, ( item ) => item.slug.toLowerCase() );
	},
	( state, siteIds ) => [
		state.plugins.installed.plugins,
		isRequestingForAllSites( state ),
		...siteIds.map( ( siteId ) => isRequesting( state, siteId ) ),
	],
	( state, siteIds, pluginFilter ) => {
		return [ siteIds, pluginFilter ].flat().join( '-' );
	}
);

export function getPluginsWithUpdates( state, siteIds ) {
	return filter( getFilteredAndSortedPlugins( state, siteIds ), _filters.updates ).map(
		( plugin ) => ( {
			...plugin,
			version: plugin?.update?.new_version,
			type: 'plugin',
		} )
	);
}

export function getPluginsOnSites( state, plugins ) {
	return Object.values( plugins ).reduce( ( acc, plugin ) => {
		const siteIds = Object.keys( plugin.sites );
		acc[ plugin.slug ] = getPluginOnSites( state, siteIds, plugin.slug );
		return acc;
	}, {} );
}

export function getPluginOnSites( state, siteIds, pluginSlug ) {
	const plugin = getAllPlugins( state )[ pluginSlug ];
	const pluginSiteIds = Object.keys( plugin.sites ).map( ( siteId ) => Number( siteId ) );

	for ( const siteId of siteIds ) {
		if ( pluginSiteIds.includes( Number( siteId ) ) ) {
			return plugin;
		}
	}

	return undefined;
}

export function getPluginOnSite( state, siteId, pluginSlug ) {
	const pluginList = getFilteredAndSortedPlugins( state, [ siteId ] );
	return find( pluginList, ( plugin ) => isEqualSlugOrId( pluginSlug, plugin ) );
}

export function getPluginsOnSite( state, siteId, pluginSlugs ) {
	return pluginSlugs.map( ( pluginSlug ) => getPluginOnSite( state, siteId, pluginSlug ) );
}

export function getSitesWithPlugin( state, siteIds, pluginSlug ) {
	const pluginList = getFilteredAndSortedPlugins( state, siteIds );
	const plugin = find( pluginList, ( pluginItem ) => isEqualSlugOrId( pluginSlug, pluginItem ) );

	if ( ! plugin ) {
		return [];
	}

	// Filter the requested sites list by the list of sites for this plugin
	const pluginSites = filter( siteIds, ( siteId ) => {
		return plugin.sites.hasOwnProperty( siteId );
	} );

	return sortBy( pluginSites, ( siteId ) => getSiteTitle( state, siteId ).toLowerCase() );
}

export function getSiteObjectsWithPlugin( state, siteIds, pluginSlug ) {
	const siteIdsWithPlugin = getSitesWithPlugin( state, siteIds, pluginSlug );
	return siteIdsWithPlugin.map( ( siteId ) => getSite( state, siteId ) );
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

		return installedOnSiteIds.every( function ( installedOnSiteId ) {
			return installedOnSiteId !== siteId;
		} );
	} );
}

export function getSiteObjectsWithoutPlugin( state, siteIds, pluginSlug ) {
	const siteIdsWithoutPlugin = getSitesWithoutPlugin( state, siteIds, pluginSlug );
	return siteIdsWithoutPlugin.map( ( siteId ) => getSite( state, siteId ) );
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

/**
 * Whether the plugin's status for one or more recent actions matches a specified status.
 *
 * @param  {object}       state    Global state tree
 * @param  {number}       siteId   ID of the site
 * @param  {string}       pluginId ID of the plugin
 * @param  {string|Array} action   Action, or array of actions of interest
 * @param  {string}       status   Status to check against
 * @returns {boolean}              True if status is the specified one for one or more actions, false otherwise.
 */
export function isPluginActionStatus( state, siteId, pluginId, action, status ) {
	const pluginStatus = getStatusForPlugin( state, siteId, pluginId );
	if ( ! pluginStatus ) {
		return false;
	}

	const actions = Array.isArray( action ) ? action : [ action ];
	return actions.includes( pluginStatus.action ) && status === pluginStatus.status;
}

/**
 * Whether the plugin's status for one or more recent actions is in progress.
 *
 * @param  {object}       state    Global state tree
 * @param  {number}       siteId   ID of the site
 * @param  {string}       pluginId ID of the plugin
 * @param  {string|Array} action   Action, or array of actions of interest
 * @returns {boolean}              True if one or more specified actions are in progress, false otherwise.
 */
export function isPluginActionInProgress( state, siteId, pluginId, action ) {
	return isPluginActionStatus( state, siteId, pluginId, action, 'inProgress' );
}

/**
 * Retrieve all plugin statuses of a certain type.
 *
 * @param  {object} state    Global state tree
 * @param  {string} status   Status of interest
 * @returns {Array}          Array of plugin status objects
 */
export const getPluginStatusesByType = createSelector(
	( state, status ) => {
		const statuses = [];

		Object.entries( state.plugins.installed.status ).map( ( [ siteId, siteStatuses ] ) => {
			Object.entries( siteStatuses ).map( ( [ pluginId, pluginStatus ] ) => {
				if ( pluginStatus.status === status ) {
					statuses.push( {
						...pluginStatus,
						siteId,
						pluginId,
					} );
				}
			} );
		} );

		return statuses;
	},
	( state ) => state.plugins.installed.status
);
