import { createSelector } from '@automattic/state-utils';
import getSitesItems from 'calypso/state/selectors/get-sites-items';
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
	PluginSite,
	PluginStatus,
} from './types';
import type { AppState } from 'calypso/types';

import 'calypso/state/plugins/init';

const emptyObject = {};
const emptyNumberArray: number[] = [];

const getSortCompareNumber = ( a: string, b: string ) => {
	if ( a < b ) {
		return -1;
	} else if ( a > b ) {
		return 1;
	}
	return 0;
};

export function isEqualSlugOrId( pluginSlug: string, plugin: Plugin ) {
	return plugin.slug === pluginSlug || plugin?.id?.split( '/' ).shift() === pluginSlug;
}

export function isRequesting( state: AppState, siteId: number ): boolean {
	if ( typeof state.plugins.installed.isRequesting[ siteId ] === 'undefined' ) {
		return false;
	}
	return state.plugins.installed.isRequesting[ siteId ];
}

export function isRequestingForSites( state: AppState, sites: number[] ) {
	// As long as any sites have isRequesting true, we consider this group requesting
	return sites.some( ( siteId ) => isRequesting( state, siteId ) );
}

export function isRequestingForAllSites( state: AppState ): boolean {
	return state.plugins.installed.isRequestingAll;
}

export function requestPluginsError( state: AppState ) {
	return state.plugins.installed.requestError;
}

const getSiteIdsThatHavePlugins = createSelector(
	( state: AppState ) => {
		return Object.keys( state.plugins.installed.plugins ).map( ( siteId ) => Number( siteId ) );
	},
	( state: AppState ) => [ state.plugins.installed.plugins ]
);

/**
 * The server returns plugins store at state.plugins.installed.plugins are indexed by site, which means
 * that the information for a plugin may be spread across multiple site objects. This selector transforms
 * that structure into one indexed by the plugin slugs and memoizes that structure.
 */
export const getAllPluginsIndexedByPluginSlug = createSelector(
	( state: AppState ) => {
		if ( isRequestingForAllSites( state ) ) {
			return emptyObject;
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

					const sitePluginInfo: { [ key: string ]: any } = {};
					[ 'active', 'autoupdate', 'update', 'version' ].forEach( ( prop ) => {
						if ( undefined !== ( plugin as any )[ prop ] ) {
							sitePluginInfo[ prop ] = ( plugin as any )[ prop ];
						}
					} );

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
	( state: AppState ) => [
		isRequestingForAllSites( state ),
		getSiteIdsThatHavePlugins( state ),
		...getSiteIdsThatHavePlugins( state ).map( ( siteId: number ) =>
			isRequesting( state, siteId )
		),
	]
) as { ( state: AppState ): { [ pluginSlug: string ]: Plugin } };

const _filters: { [ key in PluginFilter ]: ( plugin: Plugin ) => boolean } = {
	none: function () {
		return false;
	},
	all: function () {
		return true;
	},
	active: function ( plugin: Plugin ) {
		return (
			Object.values( plugin.sites ).some( ( site ) => site.active ) ||
			!! plugin.statusRecentlyChanged
		);
	},
	inactive: function ( plugin: Plugin ) {
		return (
			Object.values( plugin.sites ).some( ( site ) => ! site.active ) ||
			!! plugin.statusRecentlyChanged
		);
	},
	updates: function ( plugin: Plugin ) {
		return (
			Object.values( plugin.sites ).some(
				( site ) => !! site.update && ! site.update.recentlyUpdated
			) || !! plugin.statusRecentlyChanged
		);
	},
};

/**
 * The plugins here differ from the plugin objects found on state.plugins.installed.plugins in that each plugin
 * object has data from all the different sites on it, whereas on state.plugins.installed.plugins they only have
 * the state for the site which index they are under. The objects here are the same as those returned from
 * getAllPluginsIndexedByPluginSlug, except they are indexed by siteId.
 */
export const getAllPluginsIndexedBySiteId = createSelector(
	( state: AppState ) => {
		const allPluginsIndexedByPluginSlug = getAllPluginsIndexedByPluginSlug( state );

		return Object.values( allPluginsIndexedByPluginSlug ).reduce(
			(
				pluginsIndexedBySiteId: { [ siteId: number ]: { [ pluginSlug: string ]: Plugin } },
				plugin
			) => {
				Object.keys( plugin.sites ).forEach( ( siteIdString ) => {
					const siteId = Number( siteIdString );
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
	( state: AppState ) => [
		getAllPluginsIndexedByPluginSlug( state ),
		getSiteIdsThatHavePlugins( state ),
	]
);

export const getFilteredAndSortedPlugins = createSelector(
	( state: AppState, siteIds: number[], pluginFilter?: PluginFilter ) => {
		const allPluginsIndexedBySiteId = getAllPluginsIndexedBySiteId( state );

		const allPluginsForSites: { [ pluginSlug: string ]: Plugin } = siteIds
			.map( ( siteId: number ) => allPluginsIndexedBySiteId[ siteId ] )
			.filter( Boolean )
			.reduce( ( accumulator, current ) => ( { ...accumulator, ...current } ), {} );

		// Filter the sites object on the plugins so that only data for the requested siteIds is present
		for ( const pluginSlug of Object.keys( allPluginsForSites ) ) {
			const plugin = allPluginsForSites[ pluginSlug ];
			const filteredSites = Object.fromEntries(
				Object.entries( plugin.sites ).filter( ( [ siteId ] ) =>
					siteIds.includes( Number( siteId ) )
				)
			);
			// Mutates the existing `appPluginsForSites` object, which is a local variable, but creates
			// a shallow copy of the values, which are immutable values coming from `getAllPluginsIndexedBySiteId`.
			allPluginsForSites[ pluginSlug ] = { ...plugin, sites: filteredSites };
		}

		// Filter the plugins using the pluginFilter if it is set
		let pluginList = Object.values( allPluginsForSites );
		if ( pluginFilter && _filters[ pluginFilter ] ) {
			pluginList = pluginList.filter( ( plugin ) => _filters[ pluginFilter ]( plugin ) );
		}

		// Sort the plugins alphabetically by slug
		const sortedPluginListEntries = pluginList.sort( ( pluginA, pluginB ) => {
			const pluginSlugALower = pluginA.slug.toLowerCase();
			const pluginSlugBLower = pluginB.slug.toLowerCase();
			return getSortCompareNumber( pluginSlugALower, pluginSlugBLower );
		} );

		return sortedPluginListEntries;
	},
	( state: AppState ) => [ getAllPluginsIndexedBySiteId( state ) ],
	( state: AppState, siteIds: number[], pluginFilter?: PluginFilter ) => {
		return [ siteIds, pluginFilter ].flat().join( '-' );
	}
);

export function getPluginsWithUpdates( state: AppState, siteIds: number[] ) {
	return getFilteredAndSortedPlugins( state, siteIds, 'updates' ).map( ( plugin ) => ( {
		...plugin,
		type: 'plugin',
	} ) );
}

export function getPluginOnSites( state: AppState, siteIds: number[], pluginSlug: string ) {
	const plugin = getAllPluginsIndexedByPluginSlug( state )[ pluginSlug ];

	if ( ! plugin ) {
		return undefined;
	}

	if ( siteIds.some( ( siteId ) => !! plugin.sites[ siteId ] ) ) {
		return plugin;
	}

	return undefined;
}

export const getPluginOnSite = createSelector(
	( state: AppState, siteId: number, pluginSlug: string ) => {
		const plugin = getAllPluginsIndexedByPluginSlug( state )[ pluginSlug ];

		if ( ! plugin || ! plugin.sites[ siteId ] ) {
			return undefined;
		}

		const { sites, ...pluginWithoutSites } = plugin;

		// To keep compatibility with some behavior that existed before the refactor
		// in #73296 the returned object has the site specific data lifted onto it, and
		// the sites property has only the site data for the requested site.
		return {
			...pluginWithoutSites,
			...plugin.sites[ siteId ],
			...{ sites: { [ siteId ]: plugin.sites[ siteId ] } },
		};
	},
	( state: AppState ) => [ getAllPluginsIndexedByPluginSlug( state ) ]
) as ( state: AppState, siteId: number, pluginSlug: string ) => Plugin & PluginSite;

export const getPluginsOnSite = createSelector(
	( state: AppState, siteId: number, pluginSlugs: string[] ) => {
		return pluginSlugs.map( ( pluginSlug ) => getPluginOnSite( state, siteId, pluginSlug ) );
	},
	( state: AppState, siteId: number, pluginSlugs: string[] ) => [
		...pluginSlugs.map( ( pluginSlug ) => getPluginOnSite( state, siteId, pluginSlug ) ),
	],
	( state: AppState, siteId: number, pluginSlugs: string[] ) => [ siteId, ...pluginSlugs ].join()
) as ( state: AppState, siteId: number, pluginSlugs: string[] ) => ( Plugin & PluginSite )[];

export const getSitesWithPlugin = createSelector(
	( state: AppState, siteIds: number[], pluginSlug: string ) => {
		const plugin = getAllPluginsIndexedByPluginSlug( state )[ pluginSlug ];
		if ( ! plugin ) {
			return emptyNumberArray;
		}

		// Filter the requested sites list by the list of sites for this plugin.
		const pluginSites = siteIds.filter( ( siteId ) => plugin.sites.hasOwnProperty( siteId ) );

		// Return the plugins sorted by title.
		return pluginSites.sort( ( a, b ) => {
			const siteTitleA = getSiteTitle( state, a )?.toLowerCase() || '';
			const siteTitleB = getSiteTitle( state, b )?.toLowerCase() || '';
			return getSortCompareNumber( siteTitleA, siteTitleB );
		} );
	},
	( state: AppState ) => [ getAllPluginsIndexedByPluginSlug( state ), getSitesItems( state ) ],
	( state: AppState, siteIds: number[], pluginSlug: string ) => [ pluginSlug, ...siteIds ].join()
);

export const getSiteObjectsWithPlugin = createSelector(
	( state: AppState, siteIds: number[], pluginSlug: string ) => {
		const siteIdsWithPlugin = getSitesWithPlugin( state, siteIds, pluginSlug );
		return siteIdsWithPlugin.map( ( siteId ) => getSite( state, siteId ) );
	},
	( state: AppState ) => [ getAllPluginsIndexedByPluginSlug( state ), getSitesItems( state ) ],
	( state: AppState, siteIds: number[], pluginSlug: string ) => [ pluginSlug, ...siteIds ].join()
);

export const getSitesWithoutPlugin = createSelector(
	( state: AppState, siteIds: number[], pluginSlug: string ) => {
		const installedOnSiteIds = getSitesWithPlugin( state, siteIds, pluginSlug ) || emptyNumberArray;

		return siteIds.filter( ( siteId ) => {
			if ( ! getSite( state, siteId )?.visible || ! isJetpackSite( state, siteId ) ) {
				return false;
			}

			if ( isJetpackSiteSecondaryNetworkSite( state, siteId ) ) {
				return false;
			}

			return installedOnSiteIds.every( function ( installedOnSiteId ) {
				return installedOnSiteId !== siteId;
			} );
		} );
	},
	( state: AppState ) => [ getAllPluginsIndexedByPluginSlug( state ), getSitesItems( state ) ],
	( state: AppState, siteIds: number[], pluginSlug: string ) => [ pluginSlug, ...siteIds ].join()
);

export const getSiteObjectsWithoutPlugin = createSelector(
	( state: AppState, siteIds: number[], pluginSlug: string ) => {
		const siteIdsWithoutPlugin = getSitesWithoutPlugin( state, siteIds, pluginSlug );
		return siteIdsWithoutPlugin.map( ( siteId ) => getSite( state, siteId ) );
	},
	( state: AppState ) => [ getAllPluginsIndexedByPluginSlug( state ), getSitesItems( state ) ],
	( state: AppState, siteIds: number[], pluginSlug: string ) => [ pluginSlug, ...siteIds ].join()
);

export function getStatusForPlugin(
	state: AppState,
	siteId: number,
	pluginId: string
): PluginStatus | undefined {
	if ( typeof state.plugins.installed.status[ siteId ]?.[ pluginId ] === 'undefined' ) {
		return undefined;
	}

	return {
		...state.plugins.installed.status[ siteId ][ pluginId ],
		siteId,
		pluginId,
	};
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
export function isPluginActionStatus(
	state: AppState,
	siteId: number,
	pluginId: string,
	// TODO: refactor to take only string and not string[] to reduce complexity.
	action: string | string[],
	status: string
) {
	const pluginStatus = getStatusForPlugin( state, siteId, pluginId );
	if ( ! pluginStatus ) {
		return false;
	}

	const actions = Array.isArray( action ) ? action : [ action ];
	return actions.includes( pluginStatus?.action ) && status === pluginStatus.status;
}

/**
 * Whether the plugin's status for one or more recent actions is in progress.
 * @param  {Object}       state    Global state tree
 * @param  {number}       siteId   ID of the site
 * @param  {string}       pluginId ID of the plugin
 * @param  {string|Array} action   Action, or array of actions of interest
 * @returns {boolean}              True if one or more specified actions are in progress, false otherwise.
 */
// TODO: remove isPluginActionInProgress and use isPluginActionStatus instead.
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

/**
 * Returns true if a particular plugin is installed and active for a specified site.
 * This is useful for Jetpack connected sites.
 * @param {Object} state - Global state tree
 * @param {number} siteId - Site ID
 * @param {string} pluginSlug - Plugin slug
 * @returns {boolean} - True if that plugin is active for that site, false otherwise.
 */
export const isPluginActive = createSelector(
	( state: AppState, siteId: number, pluginSlug: string ) => {
		const sitePlugin = getAllPluginsIndexedBySiteId( state )[ siteId ]?.[ pluginSlug ];

		if ( ! sitePlugin ) {
			return false;
		}

		return sitePlugin.sites[ siteId ]?.active;
	},
	( state: AppState ) => [ getAllPluginsIndexedBySiteId( state ) ]
) as ( state: AppState, siteId: number, pluginSlug: string ) => boolean;
