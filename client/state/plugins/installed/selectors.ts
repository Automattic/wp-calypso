import { createSelector } from '@automattic/state-utils';
import { cloneDeep, filter, get, pick, some, sortBy } from 'lodash';
import {
	getSite,
	getSiteTitle,
	isJetpackSite,
	isJetpackSiteSecondaryNetworkSite,
} from 'calypso/state/sites/selectors';
import type {
	InstalledPlugins,
	InstalledPluginData,
	Plugin,
	PluginFilter,
	PluginStatus,
} from './types';
import type { AppState } from 'calypso/types';

import 'calypso/state/plugins/init';

const _filters: { [ key in PluginFilter ]: ( plugin: Plugin ) => boolean } = {
	none: function () {
		return false;
	},
	all: function () {
		return true;
	},
	active: function ( plugin: Plugin ) {
		return (
			some( plugin.sites, function ( site ) {
				return site.active;
			} ) || !! plugin.statusRecentlyChanged
		);
	},
	inactive: function ( plugin: Plugin ) {
		return (
			some( plugin.sites, function ( site ) {
				return ! site.active;
			} ) || !! plugin.statusRecentlyChanged
		);
	},
	updates: function ( plugin: Plugin ) {
		return (
			some( plugin.sites, function ( site ) {
				return !! site.update && ! site.update.recentlyUpdated;
			} ) || !! plugin.statusRecentlyChanged
		);
	},
};

export function isEqualSlugOrId( pluginSlug: string, plugin: Plugin ) {
	return plugin.slug === pluginSlug || plugin?.id?.split( '/' ).shift() === pluginSlug;
}

export function isRequesting( state: AppState, siteId: number ) {
	if ( typeof state.plugins.installed.isRequesting[ siteId ] === 'undefined' ) {
		return false;
	}
	return state.plugins.installed.isRequesting[ siteId ];
}

export function isRequestingForSites( state: AppState, sites: number[] ) {
	// As long as any sites have isRequesting true, we consider this group requesting
	return some( sites, ( siteId ) => isRequesting( state, siteId ) );
}

export function isRequestingForAllSites( state: AppState ) {
	return state.plugins.installed.isRequestingAll;
}

export function requestPluginsError( state: AppState ) {
	return state.plugins.installed.requestError;
}

const getSiteIdsThatHavePlugins = createSelector(
	( state: AppState ) => {
		return Object.keys( state.plugins.installed.plugins ).map( ( siteId ) => Number( siteId ) );
	},
	( state ) => [ state.plugins.installed.plugins ]
);

/**
 * The server returns plugins store at state.plugins.installed.plugins are indexed by site, which means
 * that the information for a plugin may be spread across multiple site objects. This selector transforms
 * that structure into one indexed by the plugin slugs and memoizes that structure.
 */
export const getAllPluginsIndexedByPluginSlug = createSelector(
	( state: AppState ) => {
		if ( isRequestingForAllSites( state ) ) {
			return {};
		}

		return getSiteIdsThatHavePlugins( state ).reduce(
			( plugins: { [ key: string ]: Plugin }, siteId ) => {
				if ( isRequesting( state, siteId ) ) {
					return plugins;
				}

				const installedPlugins = state.plugins.installed.plugins as InstalledPlugins;

				const pluginsForSite = installedPlugins[ siteId ] || [];
				pluginsForSite.forEach( ( plugin: InstalledPluginData ) => {
					const { active, autoupdate, update, version, ...otherPluginInfo } = plugin;
					const sitePluginInfo = { active, autoupdate, update, version };

					plugins[ plugin.slug ] = {
						...plugins[ plugin.slug ],
						...otherPluginInfo,
						sites: {
							...plugins[ plugin.slug ]?.sites,
							[ siteId ]: sitePluginInfo,
						},
					};
				} );
				return plugins;
			},
			{}
		);
	},
	( state ) => [
		isRequestingForAllSites( state ),
		getSiteIdsThatHavePlugins( state ),
		...getSiteIdsThatHavePlugins( state ).map( ( siteId ) => isRequesting( state, siteId ) ),
	]
);

/**
 * The plugins here differ from the plugin objects found on state.plugins.installed.plugins in that each plugin
 * object has data from all the different sites on it, whereas on state.plugins.installed.plugins they only have
 * the state for the site which index they are under. The objects here are the same as those returned from
 * getAllPluginsIndexedByPluginSlug, except they are indexed by siteId.
 */
export const getAllPluginsIndexedBySiteId = createSelector(
	( state ) => {
		const allPluginsIndexedByPluginSlug = getAllPluginsIndexedByPluginSlug( state );

		return Object.values( allPluginsIndexedByPluginSlug ).reduce(
			(
				pluginsIndexedBySiteId: { [ siteId: number ]: { [ pluginSlug: string ]: Plugin } },
				plugin
			) => {
				Object.keys( plugin.sites )
					.map( ( siteId ) => Number( siteId ) )
					.forEach( ( siteId ) => {
						pluginsIndexedBySiteId[ siteId ] = {
							...pluginsIndexedBySiteId[ siteId ],
							[ plugin.slug ]: plugin,
						};
					} );

				return pluginsIndexedBySiteId;
			},
			{}
		);
	},
	( state ) => [ getAllPluginsIndexedByPluginSlug( state ), getSiteIdsThatHavePlugins( state ) ]
);

export const getFilteredAndSortedPlugins = createSelector(
	( state: AppState, siteIds: number[], pluginFilter?: PluginFilter ) => {
		const allPluginsIndexedBySiteId = getAllPluginsIndexedBySiteId( state );

		// Properties on the objects in allPluginsIndexedBySiteId will be modified and the
		// selector memoization always returns the same object, so use cloneDeep to avoid
		// altering it for everyone.
		const allPluginsForSites: { [ pluginSlug: string ]: Plugin } = cloneDeep(
			siteIds
				.map( ( siteId: number ) => allPluginsIndexedBySiteId[ siteId ] )
				.filter( Boolean )
				.reduce( ( accumulator, current ) => ( { ...accumulator, ...current } ), {} )
		);

		// Filter the sites object on the plugins so that only data for the requested siteIds is present
		for ( const pluginSlug of Object.keys( allPluginsForSites ) ) {
			allPluginsForSites[ pluginSlug ].sites = pick(
				allPluginsForSites[ pluginSlug ].sites,
				siteIds
			);
		}

		const pluginList =
			pluginFilter && _filters[ pluginFilter ]
				? filter( allPluginsForSites, _filters[ pluginFilter ] )
				: allPluginsForSites;

		return sortBy( pluginList, ( plugin: Plugin ) => plugin.slug.toLowerCase() ) as Plugin[];
	},
	( state: AppState ) => [ getAllPluginsIndexedBySiteId( state ) ],
	( state: AppState, siteIds: number[], pluginFilter?: PluginFilter ) => {
		return [ siteIds, pluginFilter ].flat().join( '-' );
	}
);

export function getPluginsWithUpdates( state: AppState, siteIds: number[] ) {
	return filter( getFilteredAndSortedPlugins( state, siteIds, undefined ), _filters.updates ).map(
		( plugin ) => ( {
			...plugin,
			type: 'plugin',
		} )
	);
}

export function getPluginsOnSites( state: AppState, plugins: Plugin[] ) {
	return Object.values( plugins ).reduce(
		( acc: { [ pluginSlug: string ]: Plugin }, plugin: Plugin ) => {
			const siteIds = Object.keys( plugin.sites ).map( ( x ) => Number( x ) );
			const pluginOnSites = getPluginOnSites( state, siteIds, plugin.slug );
			if ( pluginOnSites ) {
				acc[ plugin.slug ] = pluginOnSites;
			}
			return acc;
		},
		{}
	);
}

export function getPluginOnSites( state: AppState, siteIds: number[], pluginSlug: string ) {
	const plugin = getAllPluginsIndexedByPluginSlug( state )[ pluginSlug ];

	if ( ! plugin ) {
		return undefined;
	}

	for ( const siteId of siteIds ) {
		if ( plugin.sites[ siteId ] ) {
			return plugin;
		}
	}

	return undefined;
}

export function getPluginOnSite( state: AppState, siteId: number, pluginSlug: string ) {
	const plugin = getAllPluginsIndexedByPluginSlug( state )[ pluginSlug ];

	const { sites, ...pluginWithoutSites } = plugin;

	return plugin && plugin.sites[ siteId ]
		? // Because this is a plugin for a single site context only the data for the selected
		  // site is included. When I changed this file to TypeScript I found that some code
		  // assumes it will be on the plugin object, while other code assumes it will be on the
		  // sites object, so I included both.
		  {
				...pluginWithoutSites,
				...plugin.sites[ siteId ],
				...{ sites: { [ siteId ]: plugin.sites[ siteId ] } },
		  }
		: undefined;
}

export function getPluginsOnSite( state: AppState, siteId: number, pluginSlugs: string[] ) {
	return pluginSlugs.map( ( pluginSlug ) => getPluginOnSite( state, siteId, pluginSlug ) );
}

export function getSitesWithPlugin( state: AppState, siteIds: number[], pluginSlug: string ) {
	const plugin = getAllPluginsIndexedByPluginSlug( state )[ pluginSlug ];
	if ( ! plugin ) {
		return [];
	}

	// Filter the requested sites list by the list of sites for this plugin
	const pluginSites = filter( siteIds, ( siteId ) => {
		return plugin.sites.hasOwnProperty( siteId );
	} );

	return sortBy( pluginSites, ( siteId ) => getSiteTitle( state, siteId )?.toLowerCase() );
}

export function getSiteObjectsWithPlugin( state: AppState, siteIds: number[], pluginSlug: string ) {
	const siteIdsWithPlugin = getSitesWithPlugin( state, siteIds, pluginSlug );
	return siteIdsWithPlugin.map( ( siteId ) => getSite( state, siteId ) );
}

export function getSitesWithoutPlugin( state: AppState, siteIds: number[], pluginSlug: string ) {
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

export function getSiteObjectsWithoutPlugin(
	state: AppState,
	siteIds: number[],
	pluginSlug: string
) {
	const siteIdsWithoutPlugin = getSitesWithoutPlugin( state, siteIds, pluginSlug );
	return siteIdsWithoutPlugin.map( ( siteId ) => getSite( state, siteId ) );
}

export function getStatusForPlugin( state: AppState, siteId: number, pluginId: string ) {
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
 * @param  {Object}       state    Global state tree
 * @param  {number}       siteId   ID of the site
 * @param  {string}       pluginId ID of the plugin
 * @param  {string|Array} action   Action, or array of actions of interest
 * @param  {string}       status   Status to check against
 * @returns {boolean}              True if status is the specified one for one or more actions, false otherwise.
 */
export function isPluginActionStatus(
	state: AppState,
	siteId: number,
	pluginId: string,
	action: string | string[],
	status: string
) {
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
 * @param  {Object}       state    Global state tree
 * @param  {number}       siteId   ID of the site
 * @param  {string}       pluginId ID of the plugin
 * @param  {string|Array} action   Action, or array of actions of interest
 * @returns {boolean}              True if one or more specified actions are in progress, false otherwise.
 */
export function isPluginActionInProgress(
	state: AppState,
	siteId: number,
	pluginId: string,
	action: string
) {
	return isPluginActionStatus( state, siteId, pluginId, action, 'inProgress' );
}

/**
 * Retrieve all plugin statuses of a certain type.
 *
 * @param  {Object} state    Global state tree
 * @param  {string} status   Status of interest
 * @returns {Array}          Array of plugin status objects
 */
export const getPluginStatusesByType = createSelector(
	( state: AppState, status: string ) => {
		const statuses: PluginStatus[] = [];

		const pluginStatuses: { [ siteId: number ]: { [ pluginId: string ]: PluginStatus } } =
			state.plugins.installed.status;

		Object.entries( pluginStatuses ).map( ( [ siteId, siteStatuses ] ) => {
			Object.entries( siteStatuses ).map( ( [ pluginId, pluginStatus ] ) => {
				if ( pluginStatus.status === status ) {
					statuses.push( {
						...pluginStatus,
						siteId: Number( siteId ),
						pluginId,
					} );
				}
			} );
		} );

		return statuses;
	},
	( state: AppState ) => state.plugins.installed.status
);
