/**
 * External dependencies
 */
import { find, filter, some, every } from 'lodash';

const isRequesting = function( state, siteId ) {
	// if the `isRequesting` attribute doesn't exist yet,
	// we assume we are still launching the fetch action, so it's true
	if ( typeof state.plugins.premium.isRequesting[ siteId ] === 'undefined' ) {
		return true;
	}
	return state.plugins.premium.isRequesting[ siteId ];
};

const hasRequested = function( state, siteId ) {
	if ( typeof state.plugins.premium.hasRequested[ siteId ] === 'undefined' ) {
		return false;
	}
	return state.plugins.premium.hasRequested[ siteId ];
};

const getPluginsForSite = function( state, siteId, whitelist = false ) {
	const pluginList = state.plugins.premium.plugins[ siteId ];
	if ( typeof pluginList === 'undefined' ) {
		return [];
	}

	// patch to solve a bug in jp 4.3 ( https://github.com/Automattic/jetpack/issues/5498 )
	if ( whitelist === 'backups' || whitelist === 'scan' ) {
		whitelist = 'vaultpress';
	}

	return filter( pluginList, ( plugin ) => {
		if ( !! whitelist ) {
			return ( whitelist === plugin.slug );
		}
		return true;
	} );
};

const isStarted = function( state, siteId, whitelist = false ) {
	const pluginList = getPluginsForSite( state, siteId, whitelist );
	return ! every( pluginList, ( item ) => {
		return ( 'wait' === item.status );
	} );
};

const isFinished = function( state, siteId, whitelist = false ) {
	const pluginList = getPluginsForSite( state, siteId, whitelist );
	if ( pluginList.length === 0 ) {
		return true;
	}

	return ! some( pluginList, ( item ) => {
		return ( ( 'done' !== item.status ) && ( item.error === null ) );
	} );
};

const isInstalling = function( state, siteId, whitelist = false ) {
	const pluginList = getPluginsForSite( state, siteId, whitelist );
	if ( pluginList.length === 0 ) {
		return false;
	}

	// If any plugin is not done/waiting/error'd, it's in an installing state.
	return some( pluginList, ( item ) => {
		return ( ( -1 === [ 'done', 'wait' ].indexOf( item.status ) ) && ( item.error === null ) );
	} );
};

const getActivePlugin = function( state, siteId, whitelist = false ) {
	const pluginList = getPluginsForSite( state, siteId, whitelist );
	const plugin = find( pluginList, ( item ) => {
		return ( ( -1 === [ 'done', 'wait' ].indexOf( item.status ) ) && ( item.error === null ) );
	} );
	if ( typeof plugin === 'undefined' ) {
		return false;
	}
	return plugin;
};

const getNextPlugin = function( state, siteId, whitelist = false ) {
	const pluginList = getPluginsForSite( state, siteId, whitelist );
	const plugin = find( pluginList, ( item ) => {
		return ( ( 'wait' === item.status ) && ( item.error === null ) );
	} );
	if ( typeof plugin === 'undefined' ) {
		return false;
	}
	return plugin;
};

export default { isRequesting, hasRequested, isStarted, isFinished, isInstalling, getPluginsForSite, getActivePlugin, getNextPlugin };
