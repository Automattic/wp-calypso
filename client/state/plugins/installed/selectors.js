/**
 * External dependencies
 */
import { every, filter, find, get, pick, reduce, some, sortBy, values } from 'lodash';

/**
 * Internal dependencies
 */
import createSelector from 'calypso/lib/create-selector';
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

	return values( sortBy( pluginList, ( item ) => item.slug.toLowerCase() ) );
}

export function getPluginsWithUpdates( state, siteIds ) {
	return filter( getPlugins( state, siteIds ), _filters.updates ).map( ( plugin ) => ( {
		...plugin,
		version: plugin?.update?.new_version,
		type: 'plugin',
	} ) );
}

export function getPluginOnSites( state, siteIds, pluginSlug ) {
	return getPlugins( state, siteIds ).find( ( plugin ) => plugin.slug === pluginSlug );
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
