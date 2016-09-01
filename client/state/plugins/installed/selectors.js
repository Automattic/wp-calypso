import filter from 'lodash/filter';
import forEach from 'lodash/forEach';
import values from 'lodash/values';
import sortBy from 'lodash/sortBy';

const _filters = {
	none: function() {
		return false;
	},
	all: function() {
		return true;
	},
	active: function( plugin ) {
		return plugin.sites.some( function( site ) {
			return site.plugin && site.plugin.active;
		} );
	},
	inactive: function( plugin ) {
		return plugin.sites.some( function( site ) {
			return site.plugin && ! site.plugin.active;
		} );
	},
	updates: function( plugin ) {
		return plugin.sites.some( function( site ) {
			return site.plugin && site.plugin.update && site.canUpdateFiles;
		} );
	},
	isEqual: function( pluginSlug, plugin ) {
		return plugin.slug === pluginSlug;
	}
};

const isRequesting = function( state, siteId ) {
	// if the `isRequesting` attribute doesn't exist yet,
	// we assume we are still launching the fetch action, so it's true
	if ( typeof state.plugins.installed.isRequesting[ siteId ] === 'undefined' ) {
		return true;
	}
	return state.plugins.installed.isRequesting[ siteId ];
};

const hasRequested = function( state, siteId ) {
	if ( typeof state.plugins.installed.hasRequested[ siteId ] === 'undefined' ) {
		return false;
	}
	return state.plugins.installed.hasRequested[ siteId ];
};

const getPlugins = function( state, sites, pluginFilter = false ) {
	let pluginList = {};
	forEach( sites, ( site ) => {
		const list = state.plugins.installed.plugins[ site.ID ] || [];
		list.map( ( item ) => {
			// plugin has a sites property which lists the sites this plugin is installed on
			// each site, in turn, has a plugin property for the specific plugin's info.
			const siteWithPlugin = Object.assign( {}, site, { plugin: item } );
			if ( pluginList[ item.slug ] ) {
				pluginList[ item.slug ].sites.push( siteWithPlugin );
			} else {
				pluginList[ item.slug ] = Object.assign( {}, item, { sites: [ siteWithPlugin ] } );
			}
		} );
	} );
	if ( !! pluginFilter && _filters[ pluginFilter ] ) {
		pluginList = filter( pluginList, _filters[ pluginFilter ] );
	}
	return values( sortBy( pluginList, item => item.slug.toLocaleLowerCase() ) );
};

const getPluginsWithUpdates = function( state, sites ) {
	const pluginList = getPlugins( state, sites );
	if ( pluginList.length === 0 ) {
		return [];
	}
	return filter( pluginList, _filters.updates );
};

const getLogsForPlugin = function( state, siteId, pluginId ) {
	if ( typeof state.plugins.installed.logs[ siteId ] === 'undefined' ) {
		return false;
	}
	if ( typeof state.plugins.installed.logs[ siteId ][ pluginId ] === 'undefined' ) {
		return false;
	}
	const log = state.plugins.installed.logs[ siteId ][ pluginId ];
	return Object.assign( {}, log, { siteId: siteId, pluginId: pluginId } );
};

const isPluginDoingAction = function( state, siteId, pluginId ) {
	const log = getLogsForPlugin( state, siteId, pluginId );
	return ( !! log ) && ( 'inProgress' === log.status );
};

export default {
	isRequesting,
	hasRequested,
	getPlugins,
	getPluginsWithUpdates,
	getLogsForPlugin,
	isPluginDoingAction
};
