import { createSelector } from '@automattic/state-utils';
import type { InstalledPlugins, InstalledPluginData, Plugin } from './types';
import type { AppState } from 'calypso/types';

import 'calypso/state/plugins/init';

export function isRequesting( state: AppState, siteId: number ) {
	if ( typeof state.plugins.installed.isRequesting[ siteId ] === 'undefined' ) {
		return false;
	}
	return state.plugins.installed.isRequesting[ siteId ];
}

export function isRequestingForAllSites( state: AppState ) {
	return state.plugins.installed.isRequestingAll;
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
