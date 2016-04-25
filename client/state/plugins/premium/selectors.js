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

const getPluginsForSite = function( state, siteId ) {
	let pluginList = state.plugins.premium.plugins[ siteId ];
	if ( typeof pluginList === 'undefined' ) {
		return [];
	}
	return pluginList;
}

const isFinished = function( state, siteId ) {
	let pluginList = getPluginsForSite( state, siteId );
	if ( pluginList.length === 0 ) {
		return false;
	}
	pluginList = filter( pluginList, ( item ) => {
		return ( ! item.status.done && ( item.error === null ) );
	} );
	return ( pluginList.length === 0 );
}

const getActivePlugin = function( state, siteId ) {
	let pluginList = getPluginsForSite( state, siteId );
	let plugin = find( pluginList, ( item ) => {
		return ( item.status.start );
	} );
	if ( typeof plugin === 'undefined' ) {
		return false;
	}
	return plugin;
};

const getNextPlugin = function( state, siteId ) {
	let pluginList = getPluginsForSite( state, siteId );
	let plugin = find( pluginList, ( item ) => {
		return ( ! item.status.start && ! item.status.done && ( item.error === null ) );
	} );
	if ( typeof plugin === 'undefined' ) {
		return false;
	}
	return plugin;
}

export default { isRequesting, isFinished, getPluginsForSite, getActivePlugin, getNextPlugin };
