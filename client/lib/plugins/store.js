/**
 * External dependencies
 */
import debugFactory from 'debug';
import { assign, clone, isArray, sortBy, values, find } from 'lodash';

/**
 * Internal dependencies
 */
import Dispatcher from 'calypso/dispatcher';
import emitter from 'calypso/lib/mixins/emitter';
/* eslint-enable no-restricted-imports */
import versionCompare from 'calypso/lib/version-compare';
import { normalizePluginData } from 'calypso/lib/plugins/utils';
import { reduxDispatch, reduxGetState } from 'calypso/lib/redux-bridge';
import getNetworkSites from 'calypso/state/selectors/get-network-sites';
import { getSite } from 'calypso/state/sites/selectors';
import { sitePluginUpdated } from 'calypso/state/sites/actions';
import { fetchSitePlugins } from 'calypso/state/plugins/installed/actions';

const debug = debugFactory( 'calypso:sites-plugins:sites-plugins-store' );

/*
 * Constants
 */
// Stores the plugins of each site.
const _fetching = {};
const _pluginsBySite = {};
const _filters = {
	none: function () {
		return false;
	},
	all: function () {
		return true;
	},
	active: function ( plugin ) {
		return plugin.sites.some( function ( site ) {
			return site.plugin && site.plugin.active;
		} );
	},
	inactive: function ( plugin ) {
		return plugin.sites.some( function ( site ) {
			return site.plugin && ! site.plugin.active;
		} );
	},
	updates: function ( plugin ) {
		return plugin.sites.some( function ( site ) {
			return site.plugin && site.plugin.update && site.canUpdateFiles;
		} );
	},
	isEqual: function ( pluginSlug, plugin ) {
		return plugin.slug === pluginSlug;
	},
};

function refreshNetworkSites( site ) {
	const networkSites = getNetworkSites( reduxGetState(), site.ID );
	if ( networkSites ) {
		networkSites.forEach( ( networkSite ) => reduxDispatch( fetchSitePlugins( networkSite.ID ) ) );
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
}

function update( site, slug, plugin ) {
	if (
		plugin.network &&
		( site.options.is_multi_site ||
			versionCompare( site.options.jetpack_version, '3.7.0-dev', '<' ) )
	) {
		return;
	}

	if ( ! _pluginsBySite[ site.ID ] ) {
		_pluginsBySite[ site.ID ] = {};
	}
	if ( ! _pluginsBySite[ site.ID ][ slug ] ) {
		_pluginsBySite[ site.ID ][ slug ] = { slug: slug };
	}
	plugin = normalizePluginData( plugin );
	_pluginsBySite[ site.ID ][ slug ] = assign( {}, _pluginsBySite[ site.ID ][ slug ], plugin );

	debug( 'update to ', _pluginsBySite[ site.ID ][ slug ] );
}

function updatePlugins( site, plugins ) {
	_fetching[ site.ID ] = false; // we are done fetching the data

	// By clearing the existing object we make sure we don't keep anything that shouldn't be there any more.
	_pluginsBySite[ site.ID ] = {};
	// Until we support network activated plugins, let's not show them at all
	plugins.forEach( function ( plugin ) {
		update( site, plugin.slug || plugin.id, plugin );
	} );
}

const PluginsStore = {
	getPlugin: function ( sites, pluginSlug ) {
		let pluginData = {};
		let fetched = false;
		pluginData.sites = [];

		sites = ! isArray( sites ) ? [ sites ] : sites;

		sites.forEach( function ( site ) {
			const sitePlugins = PluginsStore.getSitePlugins( site );
			if ( typeof sitePlugins !== 'undefined' ) {
				fetched = true;
			}
			if ( ! sitePlugins ) {
				return;
			}
			sitePlugins.forEach( function ( plugin ) {
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

	getPlugins: function ( sites, pluginFilter ) {
		let fetched = false;
		let plugins = {};

		sites = ! isArray( sites ) ? [ sites ] : sites;

		if ( sites.length === 0 ) {
			return [];
		}
		sites.forEach( function ( site ) {
			const sitePlugins = PluginsStore.getSitePlugins( site );
			if ( sitePlugins !== undefined ) {
				fetched = true;
			}
			if ( ! sitePlugins ) {
				return;
			}
			sitePlugins.forEach( function ( plugin ) {
				if ( ! plugins[ plugin.slug ] ) {
					plugins[ plugin.slug ] = assign( {}, plugin, { sites: [] } );
				}
				plugins[ plugin.slug ].sites.push( assign( {}, site, { plugin: plugin } ) );
			}, this );
		} );
		if ( ! fetched ) {
			return;
		}
		plugins = sortBy( plugins, function ( plugin ) {
			return plugin.name;
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
	getSitePlugins: function ( site ) {
		if ( ! site ) {
			return [];
		}
		if ( ! _pluginsBySite[ site.ID ] && ! _fetching[ site.ID ] ) {
			reduxDispatch( fetchSitePlugins( site.ID ) );
			_fetching[ site.ID ] = true;
		}
		if ( ! _pluginsBySite[ site.ID ] ) {
			return _pluginsBySite[ site.ID ];
		}
		return values( _pluginsBySite[ site.ID ] );
	},

	getSitePlugin: function ( site, pluginSlug ) {
		const plugins = this.getSitePlugins( site );
		if ( ! plugins ) {
			return plugins;
		}

		return find( plugins, _filters.isEqual.bind( this, pluginSlug ) );
	},

	// Array of sites with a particular plugin.
	getSites: function ( sites, pluginSlug ) {
		const plugins = this.getPlugins( sites );
		if ( ! plugins ) {
			return;
		}

		const plugin = find( plugins, _filters.isEqual.bind( this, pluginSlug ) );
		if ( ! plugin ) {
			return null;
		}

		const pluginSites = plugin.sites
			.filter( ( site ) => site.visible )
			.map( ( site ) => {
				// clone the site object before adding a new property. Don't modify the return value of getSite
				const pluginSite = clone( getSite( reduxGetState(), site.ID ) );
				pluginSite.plugin = site.plugin;
				return pluginSite;
			} );

		return pluginSites.sort( function ( first, second ) {
			return first.title.toLowerCase() > second.title.toLowerCase() ? 1 : -1;
		} );
	},

	isFetchingSite: function ( site ) {
		return _fetching[ site.ID ];
	},

	// Array of sites without a particular plugin.
	getNotInstalledSites: function ( sites, pluginSlug ) {
		const installedOnSites = this.getSites( sites, pluginSlug ) || [];
		return sites.filter( function ( site ) {
			if ( ! site.visible ) {
				return false;
			}
			if ( site.jetpack && site.isSecondaryNetworkSite ) {
				return false;
			}

			return installedOnSites.every( function ( installedOnSite ) {
				return installedOnSite.slug !== site.slug;
			} );
		} );
	},

	emitChange: function () {
		this.emit( 'change' );
	},
};

PluginsStore.dispatchToken = Dispatcher.register( function ( { action } ) {
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

		case 'UPDATE_PLUGIN':
			PluginsStore.emitChange();
			break;

		case 'REMOVE_PLUGINS_UPDATE_INFO':
			update( action.site, action.plugin.slug, { update: null } );
			PluginsStore.emitChange();
			break;

		case 'RECEIVE_UPDATED_PLUGIN':
			if ( action.error ) {
				debug( 'plugin updating error', action.error );

				// still needs to be updated
				update( action.site, action.plugin.slug, { update: action.plugin.update } );
			} else {
				update(
					action.site,
					action.plugin.slug,
					Object.assign( { update: { recentlyUpdated: true } }, action.data )
				);
				reduxDispatch( sitePluginUpdated( action.site.ID ) );
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
			if (
				( action.error && action.error.error !== 'activation_error' ) ||
				( ! ( action.data && action.data.active ) && ! action.error )
			) {
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
export default PluginsStore;
