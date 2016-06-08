import find from 'lodash/find';
import filter from 'lodash/filter';

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

const getPluginsForSite = function( state, siteId ) {
	let pluginList = state.plugins.premium.plugins[ siteId ];
	if ( typeof pluginList === 'undefined' ) {
		return [];
	}
	return pluginList;
};

const isFinished = function( state, siteId ) {
	let pluginList = getPluginsForSite( state, siteId );
	if ( pluginList.length === 0 ) {
		return true;
	}
	pluginList = filter( pluginList, ( item ) => {
		return ( ( 'done' !== item.status ) && ( item.error === null ) );
	} );
	return ( pluginList.length === 0 );
};

const isInstalling = function( state, siteId ) {
	let pluginList = getPluginsForSite( state, siteId );
	if ( pluginList.length === 0 ) {
		return false;
	}
	pluginList = filter( pluginList, ( item ) => {
		return ( ( -1 === [ 'done', 'wait'].indexOf( item.status ) ) && ( item.error === null ) );
	} );
	// If any plugin is not done/waiting/error'd, it's in an installing state.
	return ( pluginList.length > 0 );
};

const getActivePlugin = function( state, siteId ) {
	let pluginList = getPluginsForSite( state, siteId );
	let plugin = find( pluginList, ( item ) => {
		return ( ( -1 === [ 'done', 'wait'].indexOf( item.status ) ) && ( item.error === null ) );
	} );
	if ( typeof plugin === 'undefined' ) {
		return false;
	}
	return plugin;
};

const getNextPlugin = function( state, siteId ) {
	let pluginList = getPluginsForSite( state, siteId );
	let plugin = find( pluginList, ( item ) => {
		return ( ( 'wait' === item.status ) && ( item.error === null ) );
	} );
	if ( typeof plugin === 'undefined' ) {
		return false;
	}
	return plugin;
};

export default { isRequesting, hasRequested, isFinished, isInstalling, getPluginsForSite, getActivePlugin, getNextPlugin };
