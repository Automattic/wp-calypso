import {
	filter,
	forEach,
	values,
	sortBy,
	find,
	uniq,
	compact,
	omit,
	every,
	some
} from 'lodash';

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

export function getPlugins( state, sites, pluginFilter = false ) {
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
	return values( sortBy( pluginList, item => item.slug.toLowerCase() ) );
}

export function getPluginsWithUpdates( state, sites ) {
	return filter( getPlugins( state, sites ), _filters.updates );
}

export function getPluginOnSite( state, site, pluginSlug ) {
	const pluginList = getPlugins( state, [ site ] );
	return find( pluginList, { slug: pluginSlug } ) || false;
}

export function getSitesWithPlugin( state, sites, pluginSlug ) {
	const pluginList = getPlugins( state, sites );
	const plugin = find( pluginList, { slug: pluginSlug } );
	if ( ! plugin ) {
		return [];
	}

	const pluginSites = uniq( compact(
		plugin.sites.map( function( site ) {
			// we create a copy of the site to avoid any possible modification down the line affecting the main list
			const pluginSite = Object.assign( {}, site, { plugin: omit( plugin, 'sites' ) } );
			if ( site.visible ) {
				return pluginSite;
			}
		} )
	) );

	return sortBy( pluginSites, item => item.title.toLowerCase() );
}

export function getSitesWithoutPlugin( state, sites, pluginSlug ) {
	const installedOnSites = getSitesWithPlugin( state, sites, pluginSlug ) || [];
	return filter( sites, function( site ) {
		if ( ! site.visible || ! site.jetpack ) {
			return false;
		}

		if ( site.jetpack && site.isSecondaryNetworkSite() ) {
			return false;
		}

		return every( installedOnSites, function( installedOnSite ) {
			return installedOnSite.slug !== site.slug;
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

export function isPluginDoingAction( state, siteId, pluginId ) {
	const status = getStatusForPlugin( state, siteId, pluginId );
	return ( !! status ) && ( 'inProgress' === status.status );
}
