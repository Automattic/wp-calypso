/**
 * External dependencies
 */
import { every, filter, find, get, includes, some } from 'lodash';

/**
 * Internal dependencies
 */
import createSelector from 'calypso/lib/create-selector';

import 'calypso/state/plugins/init';

export const isRequesting = function ( state, siteId ) {
	// if the `isRequesting` attribute doesn't exist yet,
	// we assume we are still launching the fetch action, so it's true
	if ( typeof state.plugins.premium.isRequesting[ siteId ] === 'undefined' ) {
		return true;
	}
	return state.plugins.premium.isRequesting[ siteId ];
};

export const hasRequested = function ( state, siteId ) {
	if ( typeof state.plugins.premium.hasRequested[ siteId ] === 'undefined' ) {
		return false;
	}
	return state.plugins.premium.hasRequested[ siteId ];
};

/**
 * Gets the list of plugins for a site and optionally filters to a single specific
 * plugin.
 *
 * @param {object} state The current state.
 * @param {number} siteId The site ID.
 * @param {string?} forPlugin Name of a specific plugin to filter for, `false` otherwise to return the full list.
 * @returns {Array<object>} The list of plugins.
 */
export const getPluginsForSite = function ( state, siteId, forPlugin = false ) {
	const pluginList = state.plugins.premium.plugins[ siteId ];
	if ( typeof pluginList === 'undefined' ) {
		return [];
	}

	// patch to solve a bug in jp 4.3 ( https://github.com/Automattic/jetpack/issues/5498 )
	if ( forPlugin === 'backups' || forPlugin === 'scan' ) {
		forPlugin = 'vaultpress';
	}

	return filter( pluginList, ( plugin ) => {
		// eslint-disable-next-line no-extra-boolean-cast
		if ( !! forPlugin ) {
			return forPlugin === plugin.slug;
		}
		return true;
	} );
};

export const isStarted = function ( state, siteId, forPlugin = false ) {
	const pluginList = getPluginsForSite( state, siteId, forPlugin );
	return ! every( pluginList, ( item ) => {
		return 'wait' === item.status;
	} );
};

export const isFinished = function ( state, siteId, forPlugin = false ) {
	const pluginList = getPluginsForSite( state, siteId, forPlugin );
	if ( pluginList.length === 0 ) {
		return true;
	}

	return ! some( pluginList, ( item ) => {
		return 'done' !== item.status && item.error === null;
	} );
};

export const isInstalling = function ( state, siteId, forPlugin = false ) {
	const pluginList = getPluginsForSite( state, siteId, forPlugin );
	if ( pluginList.length === 0 ) {
		return false;
	}

	// If any plugin is not done/waiting/error'd, it's in an installing state.
	return some( pluginList, ( item ) => {
		return ! includes( [ 'done', 'wait' ], item.status ) && item.error === null;
	} );
};

export const getActivePlugin = function ( state, siteId, forPlugin = false ) {
	const pluginList = getPluginsForSite( state, siteId, forPlugin );
	const plugin = find( pluginList, ( item ) => {
		return ! includes( [ 'done', 'wait' ], item.status ) && item.error === null;
	} );
	if ( typeof plugin === 'undefined' ) {
		return false;
	}
	return plugin;
};

export const getNextPlugin = function ( state, siteId, forPlugin = false ) {
	const pluginList = getPluginsForSite( state, siteId, forPlugin );
	const plugin = find( pluginList, ( item ) => {
		return 'wait' === item.status && item.error === null;
	} );
	if ( typeof plugin === 'undefined' ) {
		return false;
	}
	return plugin;
};

export const getPluginKeys = createSelector(
	( state, siteId, forPlugin = false ) => {
		const pluginList = getPluginsForSite( state, siteId, forPlugin );

		return pluginList.reduce( ( keys, plugin ) => {
			const key = get( plugin, 'key' );
			const slug = get( plugin, 'slug' );

			return {
				...keys,
				[ slug ]: key,
			};
		}, {} );
	},
	( state, siteId ) => [ state.plugins.premium.plugins[ siteId ] ]
);
