import { createSelector } from '@automattic/state-utils';
import { filter, find, get, pick, reduce, some, sortBy } from 'lodash';
import {
	getSite,
	getSiteTitle,
	isJetpackSite,
	isJetpackSiteSecondaryNetworkSite,
} from 'calypso/state/sites/selectors';
import 'calypso/state/plugins/init';
import { PLUGINS_STATUS } from './status/constants';

// TODO: Much of the functionality in this file is duplicated with selectors.js
// which needs to be removed when this file is complete.

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

function getPluginsSelector( state, siteIds, pluginFilter ) {
	let pluginList = reduce(
		siteIds,
		( memo, siteId ) => {
			if ( isRequesting( state, siteId ) ) {
				return memo;
			}

			// We currently support fetching plugins per site and also fetching all plugins
			// in bulk, aiming to optimize the UX in some flows.
			if ( isRequestingForAllSites( state ) ) {
				return memo;
			}

			const list = state.plugins.installed.plugins[ siteId ] || [];
			list.forEach( ( item ) => {
				const sitePluginInfo = pick( item, [ 'active', 'autoupdate', 'update', 'version' ] );

				memo[ item.slug ] = {
					...memo[ item.slug ],
					...item,
					sites: {
						...memo[ item.slug ]?.sites,
						[ siteId ]: sitePluginInfo,
					},
				};
			} );
			return memo;
		},
		{}
	);

	if ( pluginFilter && _filters[ pluginFilter ] ) {
		pluginList = filter( pluginList, _filters[ pluginFilter ] );
	}

	return sortBy( pluginList, ( item ) => item.slug.toLowerCase() );
}

export const getPlugins = createSelector(
	getPluginsSelector,
	( state, siteIds ) => [
		state.plugins.installed.plugins,
		isRequestingForAllSites( state ),
		...siteIds.map( ( siteId ) => isRequesting( state, siteId ) ),
	],
	( state, siteIds, pluginFilter ) => {
		return [ siteIds, pluginFilter ].flat().join( '-' );
	}
);

export const getPluginsWithUpdateStatuses = createSelector(
	( state, plugins, withUpdate, inactive, active ) => {
		return plugins.reduce( ( memo, plugin ) => {
			const status = [];
			plugin.allStatuses = [];

			Object.entries( state.plugins.installed.status ).map( ( [ siteId, siteStatuses ] ) => {
				Object.entries( siteStatuses ).map( ( [ pluginId, pluginStatus ] ) => {
					if ( plugin.id === pluginId ) {
						plugin.allStatuses.push( {
							...pluginStatus,
							siteId,
							pluginId,
						} );
					}
				} );
			} );

			if ( find( withUpdate, { slug: plugin.slug } ) ) {
				status.push( PLUGINS_STATUS.UPDATE );
			}

			if ( find( inactive, { slug: plugin.slug } ) ) {
				status.push( PLUGINS_STATUS.INACTIVE );
			}

			if ( find( active, { slug: plugin.slug } ) ) {
				status.push( PLUGINS_STATUS.ACTIVE );
			}
			return [ ...memo, { ...plugin, status } ];
		}, [] );
	},
	( plugins, pluginsUpdate ) => [ plugins, pluginsUpdate ]
);

export function getPluginsWithUpdates( state, siteIds ) {
	return filter( getPlugins( state, siteIds ), _filters.updates ).map( ( plugin ) => ( {
		...plugin,
		version: plugin?.update?.new_version,
		type: 'plugin',
	} ) );
}

export const getPluginOnSites = createSelector( ( state, siteIds, pluginSlug ) =>
	getPlugins( state, siteIds ).find( ( plugin ) => isEqualSlugOrId( pluginSlug, plugin ) )
);

export const getPluginsOnSites = createSelector( ( state, plugins ) => {
	return Object.values( plugins ).reduce( ( acc, plugin ) => {
		const siteIds = Object.keys( plugin.sites );
		acc[ plugin.slug ] = getPluginOnSites( state, siteIds, plugin.slug );
		return acc;
	}, {} );
} );

export function getPluginOnSite( state, siteId, pluginSlug ) {
	const pluginList = getPlugins( state, [ siteId ] );
	return find( pluginList, ( plugin ) => isEqualSlugOrId( pluginSlug, plugin ) );
}

export function getPluginsOnSite( state, siteId, pluginSlugs ) {
	return pluginSlugs.map( ( pluginSlug ) => getPluginOnSite( state, siteId, pluginSlug ) );
}

export function getSitesWithPlugin( state, siteIds, pluginSlug ) {
	const pluginList = getPlugins( state, siteIds );
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
 * @param  {Object}       state    Global state tree
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
 * @param  {Object}       state    Global state tree
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
 * @param  {Object} state    Global state tree
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
