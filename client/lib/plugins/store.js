/**
 * External dependencies
 */
var assign = require( 'lodash/assign' ),
	isArray = require( 'lodash/isArray' ),
	debug = require( 'debug' )( 'calypso:sites-plugins:sites-plugins-store' ),
	sortBy = require( 'lodash/sortBy' ),
	uniq = require( 'lodash/uniq' ),
	compact = require( 'lodash/compact' ),
	values = require( 'lodash/values' );

/**
 * Internal dependencies
 */
var Dispatcher = require( 'dispatcher' ),
	localStore = require( 'store' ),
	emitter = require( 'lib/mixins/emitter' ),
	sitesList = require( 'lib/sites-list' )(),
	PluginsActions = require( 'lib/plugins/actions' ),
	versionCompare = require( 'lib/version-compare' ),
	PluginUtils = require( 'lib/plugins/utils' ),
	JetpackSite = require( 'lib/site/jetpack' ),
	Site = require( 'lib/site' ),
	config = require( 'config' );

/*
 * Constants
 */
var _CACHE_TIME_TO_LIVE = 10 * 1000, // 10 sec
	// time to wait until a plugin recentlyUpdate flag is cleared once it's updated
	_UPDATED_PLUGIN_INFO_TIME_TO_LIVE = 10 * 1000,
	_STORAGE_LIST_NAME = 'CachedPluginsBySite';

// Stores the plugins of each site.
var _fetching = {},
	_pluginsBySite = {},
	PluginsStore,
	_filters = {
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

function refreshNetworkSites( site ) {
	var networkSites = sitesList.getNetworkSites( site );
	if ( networkSites ) {
		networkSites.forEach( PluginsActions.fetchSitePlugins );
	}
}

function install( site, slug, plugin ) {
	update( site, slug, plugin );
	refreshNetworkSites( site );
}

function remove( site, slug ) {
	refreshNetworkSites( site );

	if ( ! _pluginsBySite[ site.ID ] ) {
		_pluginsBySite[ site.ID ] = {};
	}

	delete _pluginsBySite[ site.ID ][ slug ];

	debug( 'removed plugin ' + slug );
	storePluginsBySite( site.ID, _pluginsBySite[ site.ID ] );
}

function update( site, slug, plugin ) {
	if ( plugin.network && ( site.options.is_multi_site || versionCompare( site.options.jetpack_version, '3.7.0-dev', '<' ) ) ) {
		return;
	}

	if ( ! _pluginsBySite[ site.ID ] ) {
		_pluginsBySite[ site.ID ] = {};
	}
	if ( ! _pluginsBySite[ site.ID ][ slug ] ) {
		_pluginsBySite[ site.ID ][ slug ] = { slug: slug };
	}
	plugin = PluginUtils.normalizePluginData( plugin );
	_pluginsBySite[ site.ID ][ slug ] = assign( {}, _pluginsBySite[ site.ID ][ slug ], plugin );

	debug( 'update to ', _pluginsBySite[ site.ID ][ slug ] );
	storePluginsBySite( site.ID, _pluginsBySite[ site.ID ] );
}

function updatePlugins( site, plugins ) {
	_fetching[ site.ID ] = false; // we are done fetching the data

	// By clearing the existing object we make sure we don't keep anything that shouldn't be there any more.
	_pluginsBySite[ site.ID ] = {};
	// Until we support network activated plugins, let's not show them at all
	plugins.forEach( function( plugin ) {
		update( site, plugin.slug || plugin.id, plugin );
	} );
}

function getPluginsBySiteFromStorage( siteId ) {
	var storedLists;
	if ( config.isEnabled( 'manage/plugins/cache' ) ) {
		storedLists = localStore.get( _STORAGE_LIST_NAME );
		return storedLists && storedLists[ siteId ];
	}
}

function storePluginsBySite( siteId, pluginsList ) {
	var storedLists;

	if ( config.isEnabled( 'manage/plugins/cache' ) ) {
		storedLists = localStore.get( _STORAGE_LIST_NAME ) || {};
		storedLists[ siteId ] = {
			list: pluginsList,
			fetched: Date.now()
		};
		localStore.set( _STORAGE_LIST_NAME, storedLists );
	}
}

function isCachedListStillValid( storedList ) {
	return ( storedList && ( Date.now() - storedList.fetched < _CACHE_TIME_TO_LIVE ) );
}

PluginsStore = {

	getPlugin: function( sites, pluginSlug ) {
		var pluginData = {},
			fetched = false;
		pluginData.sites = [];

		sites = ( ! isArray( sites ) ? [ sites ] : sites );

		sites.forEach( function( site ) {
			var sitePlugins = PluginsStore.getSitePlugins( site );
			if ( typeof sitePlugins !== 'undefined' ) {
				fetched = true;
			}
			if ( ! sitePlugins ) {
				return;
			}
			sitePlugins.forEach( function( plugin ) {
				if ( plugin.slug === pluginSlug ) {
					pluginData = assign( pluginData, plugin );
					pluginData.sites.push( assign( {}, site, { plugin: plugin } ) );
				}
			}, this );
		} );

		if ( ! fetched ) {
			return;
		}
		return pluginData;
	},

	getPlugins: function( sites, pluginFilter ) {
		var fetched = false,
			plugins = {};

		sites = ! isArray( sites ) ? [ sites ] : sites;

		if ( sites.length === 0 ) {
			return [];
		}
		sites.forEach( function( site ) {
			var sitePlugins = PluginsStore.getSitePlugins( site );
			if ( sitePlugins !== undefined ) {
				fetched = true;
			}
			if ( ! sitePlugins ) {
				return;
			}
			sitePlugins.forEach( function( plugin ) {
				if ( ! plugins[ plugin.slug ] ) {
					plugins[ plugin.slug ] = assign( {}, plugin, { sites: [] } );
				}
				plugins[ plugin.slug ].sites.push( assign( {}, site, { plugin: plugin } ) );
			}, this );
		} );
		if ( ! fetched ) {
			return;
		}
		plugins = sortBy( plugins, function( plugin ) {
			return plugin.slug;
		} );
		if ( ! plugins ) {
			return [];
		}

		if ( plugins.filter && !! pluginFilter && _filters[ pluginFilter ] ) {
			plugins = plugins.filter( _filters[ pluginFilter ] );
		}
		return plugins;
	},

	// Get Plugins for a single site
	getSitePlugins: function( site ) {
		var storedList;
		if ( ! _pluginsBySite[ site.ID ] && ! _fetching[ site.ID ] ) {
			storedList = getPluginsBySiteFromStorage( site.ID );

			_pluginsBySite[ site.ID ] = storedList && storedList.list;

			if ( ! isCachedListStillValid( storedList ) ) {
				PluginsActions.fetchSitePlugins( site );
				_fetching[ site.ID ] = true;
			}
		}
		if ( ! _pluginsBySite[ site.ID ] ) {
			return _pluginsBySite[ site.ID ];
		}
		return values( _pluginsBySite[ site.ID ] );
	},

	getSitePlugin: function( site, pluginSlug ) {
		var plugins = this.getSitePlugins( site );
		if ( ! plugins ) {
			return plugins;
		}
		plugins = plugins.filter( _filters.isEqual.bind( this, pluginSlug ) );
		return plugins[ 0 ];
	},

	// Array of sites with a particular plugin.
	getSites: function( sites, pluginSlug ) {
		var plugin,
			plugins = this.getPlugins( sites ),
			pluginSites;
		if ( ! plugins ) {
			return;
		}
		plugins = plugins.filter( _filters.isEqual.bind( this, pluginSlug ) );
		plugin = plugins.pop();
		if ( ! plugin ) {
			return null;
		}

		pluginSites = uniq(
			compact(
				plugin.sites.map( function( site ) {
					// we create a copy of the site to avoid any possible modification down the line affecting the main list
					let pluginSite = site.jetpack
						? new JetpackSite( sitesList.getSite( site.ID ) )
						: new Site( sitesList.getSite( site.ID ) );
					pluginSite.plugin = site.plugin;
					if ( site.visible ) {
						return pluginSite;
					}
				} )
			)
		);
		return pluginSites.sort( function( first, second ) {
			return first.title.toLowerCase() > second.title.toLowerCase() ? 1 : -1;
		} );
	},

	isFetchingSite: function( site ) {
		return _fetching[ site.ID ];
	},

	// Array of sites without a particular plugin.
	getNotInstalledSites: function( sites, pluginSlug ) {
		var installedOnSites = this.getSites( sites, pluginSlug ) || [];
		return sites.filter( function( site ) {
			if ( ! site.visible ) {
				return false;
			}

			if ( site.jetpack && site.isSecondaryNetworkSite() ) {
				return false;
			}

			return installedOnSites.every( function( installedOnSite ) {
				return installedOnSite.slug !== site.slug;
			} );
		} );
	},

	emitChange: function() {
		this.emit( 'change' );
	}
};

PluginsStore.dispatchToken = Dispatcher.register( function( { action } ) {
	debug( 'register event Type', action.type, action );

	switch ( action.type ) {
		case 'RECEIVE_PLUGINS':
			_fetching[ action.site.ID ] = false;
			if ( action.error ) {
				updatePlugins( action.site, [] );
				PluginsStore.emitChange();
				return;
			}

			updatePlugins( action.site, action.data.plugins );
			PluginsStore.emitChange();
			break;

		case 'NOT_ALLOWED_TO_RECEIVE_PLUGINS':
			_fetching[ action.site.ID ] = false;
			_pluginsBySite[ action.site.ID ] = {};
			PluginsStore.emitChange();
			break;

		case 'AUTOUPDATE_PLUGIN':
		case 'UPDATE_PLUGIN':
			PluginsStore.emitChange();
			break;

		case 'REMOVE_PLUGINS_UPDATE_INFO':
			update( action.site, action.plugin.slug, { update: null } );
			PluginsStore.emitChange();
			break;

		case 'RECEIVE_AUTOUPDATE_PLUGIN':
		case 'RECEIVE_UPDATED_PLUGIN':
			if ( action.error ) {
				debug( 'plugin updating error', action.error );

				// still needs to be updated
				update( action.site, action.plugin.slug, { update: action.plugin.update } );
			} else {
				update( action.site,
					action.plugin.slug,
					Object.assign( { update: { recentlyUpdated: true } }, action.data )
				);
				sitesList.onUpdatedPlugin( action.site );
				setTimeout( PluginsActions.removePluginUpdateInfo.bind( PluginsActions, action.site, action.plugin ), _UPDATED_PLUGIN_INFO_TIME_TO_LIVE );
			}
			PluginsStore.emitChange();
			break;

		case 'RECEIVE_INSTALLED_PLUGIN':
			if ( action.error ) {
				debug( 'plugin installing error', action.error );
			} else {
				install( action.site, action.plugin.slug, action.data );
			}
			PluginsStore.emitChange();
			break;

		case 'RECEIVE_REMOVE_PLUGIN':
			if ( action.error ) {
				debug( 'plugin removing error', action.error );
				update( action.site, action.plugin.slug, action.plugin );
			} else {
				remove( action.site, action.plugin.slug );
			}
			PluginsStore.emitChange();
			break;

		case 'ACTIVATE_PLUGIN':
			update( action.site, action.plugin.slug, { active: true } );
			PluginsStore.emitChange();
			break;

		case 'DEACTIVATE_PLUGIN':
			update( action.site, action.plugin.slug, { active: false } );
			PluginsStore.emitChange();
			break;

		case 'RECEIVE_ACTIVATED_PLUGIN':
			if ( ( action.error && action.error.error !== 'activation_error' ) || ! ( action.data && action.data.active ) && ! action.error ) {
				debug( 'plugin activation error', action.error );
				update( action.site, action.plugin.slug, { active: false } );
			} else {
				update( action.site, action.plugin.slug, { active: true } );
			}
			PluginsStore.emitChange();
			break;

		case 'RECEIVE_DEACTIVATED_PLUGIN':
			if ( action.error && action.error.error !== 'deactivation_error' ) {
				debug( 'plugin deactivation error', action.error );
				update( action.site, action.plugin.slug, { active: true } );
			} else {
				update( action.site, action.plugin.slug, { active: false } );
			}
			PluginsStore.emitChange();
			break;

		case 'ENABLE_AUTOUPDATE_PLUGIN':
			update( action.site, action.plugin.slug, { autoupdate: true } );
			PluginsStore.emitChange();
			break;

		case 'DISABLE_AUTOUPDATE_PLUGIN':
			update( action.site, action.plugin.slug, { autoupdate: false } );
			PluginsStore.emitChange();
			break;

		case 'RECEIVE_ENABLED_AUTOUPDATE_PLUGIN':
			if ( action.error ) {
				debug( 'plugin activation error', action.error );
				update( action.site, action.plugin.slug, { autoupdate: false } );
			} else {
				update( action.site, action.plugin.slug, { autoupdate: true } );
			}
			PluginsStore.emitChange();
			break;

		case 'RECEIVE_DISABLED_AUTOUPDATE_PLUGIN':
			if ( action.error ) {
				debug( 'plugin deactivation error', action.error );
				update( action.site, action.plugin.slug, { autoupdate: true } );
			} else {
				update( action.site, action.plugin.slug, { autoupdate: false } );
			}
			PluginsStore.emitChange();
			break;
	}
} );

emitter( PluginsStore );
module.exports = PluginsStore;
