/**
 * External dependencies
 */
const wpcom = require( 'lib/wp' );
import keys from 'lodash/keys';

/**
 * Internal dependencies
 */
import Dispatcher from 'dispatcher';
import {
	PLUGIN_SETUP_INSTRUCTIONS_FETCH,
	PLUGIN_SETUP_INSTRUCTIONS_RECEIVE,
	PLUGIN_SETUP_INSTALL,
	PLUGIN_SETUP_ACTIVATE,
	PLUGIN_SETUP_CONFIGURE,
	PLUGIN_SETUP_FINISH,
	PLUGIN_SETUP_ERROR
} from 'state/action-types';

/**
 *  Local variables;
 */
const _fetching = {};

const normalizePluginInstructions = ( data ) => {
	const _plugins = data.keys;
	return keys( _plugins ).map( ( key ) => {
		const plugin = _plugins[key];
		return {
			slug: plugin.slug || key,
			name: plugin.name || key,
			key: plugin.key || plugin,
			status: 'wait',
			error: null,
		};
	} );
};

/**
 * Return a SitePlugin instance used to handle the plugin
 *
 * @param {Object} site - site object
 * @param {String} pluginId - plugin identifier
 * @return {SitePlugin} SitePlugin instance
 */
const getPluginHandler = ( site, pluginId ) => {
	const siteHandler = wpcom.site( site.ID );
	const pluginHandler = siteHandler.plugin( pluginId );
	return pluginHandler;
};

function install( site, plugin, dispatch ) {
	console.log( '# Start installing', plugin.slug );
	Dispatcher.handleViewAction( {
		type: 'INSTALL_PLUGIN',
		action: 'INSTALL_PLUGIN',
		site: site,
		plugin: plugin,
		data: null,
		error: null
	} );

	if ( plugin.active ) {
		console.log( '# Already installed', plugin.slug );
		dispatch( {
			type: PLUGIN_SETUP_CONFIGURE,
			siteId: site.ID,
			slug: plugin.slug,
		} );
		configure( site, plugin, dispatch );
		return;
	}

	getPluginHandler( site, plugin.id ).install().then( ( data ) => {
		dispatch( {
			type: PLUGIN_SETUP_ACTIVATE,
			siteId: site.ID,
			slug: plugin.slug,
		} );

		activate( site, data, dispatch );
	} ).catch( ( error ) => {
		if ( error.name === 'PluginAlreadyInstalledError' ) {
			update( site, plugin, dispatch );
		} else {
			console.log( '!! Error [install]', error.name, error.message );
			dispatch( {
				type: PLUGIN_SETUP_ERROR,
				siteId: site.ID,
				slug: plugin.slug,
				error,
			} );
			Dispatcher.handleServerAction( {
				type: 'RECEIVE_INSTALLED_PLUGIN',
				action: 'INSTALL_PLUGIN',
				site: site,
				plugin: plugin,
				data: null,
				error: error
			} );
		}
	} );
}

function update( site, plugin, dispatch ) {
	console.log( '# Trying to update', plugin.name );
	getPluginHandler( site, plugin.id ).update().then( ( data ) => {
		dispatch( {
			type: PLUGIN_SETUP_ACTIVATE,
			siteId: site.ID,
			slug: plugin.slug,
		} );

		activate( site, data, dispatch );
	} ).catch( ( error ) => {
		console.log( '!! Error [update]', error.name, error.message );
		dispatch( {
			type: PLUGIN_SETUP_ERROR,
			siteId: site.ID,
			slug: plugin.slug,
			error,
		} );
		Dispatcher.handleServerAction( {
			type: 'RECEIVE_INSTALLED_PLUGIN',
			action: 'INSTALL_PLUGIN',
			site: site,
			plugin: plugin,
			data: null,
			error: error
		} );
	} );
}

function activate( site, plugin, dispatch ) {
	console.log( '# Trying to activate', plugin.name );
	const success = ( data ) => {
		dispatch( {
			type: PLUGIN_SETUP_CONFIGURE,
			siteId: site.ID,
			slug: data.slug,
		} );
		Dispatcher.handleServerAction( {
			type: 'RECEIVE_INSTALLED_PLUGIN',
			action: 'INSTALL_PLUGIN',
			site: site,
			plugin: data,
			data: data,
			error: null
		} );

		autoupdate( site, data );
		configure( site, data, dispatch );
	};

	getPluginHandler( site, plugin.id ).activate().then( success ).catch( ( error ) => {
		console.log( '!! Error [activate]', error.name, error.message );
		if ( error.name === 'ActivationErrorError' ) {
			// Technically it failed, but only because it's already active.
			success( plugin );
			return;
		}
		dispatch( {
			type: PLUGIN_SETUP_ERROR,
			siteId: site.ID,
			slug: plugin.slug,
			error,
		} );
		Dispatcher.handleServerAction( {
			type: 'RECEIVE_INSTALLED_PLUGIN',
			action: 'INSTALL_PLUGIN',
			site: site,
			plugin: plugin,
			data: null,
			error: error
		} );
	} );
}

function autoupdate( site, plugin ) {
	getPluginHandler( site, plugin.id ).enableAutoupdate();
}

function configure( site, plugin, dispatch ) {
	console.log( '# Start configuring', plugin.slug );
	setTimeout( () => {
		dispatch( {
			type: PLUGIN_SETUP_FINISH,
			siteId: site.ID,
			slug: plugin.slug,
		} );
	}, 1500 );
}

export default {
	fetchInstallInstructions: function( siteId ) {
		return ( dispatch ) => {
			if ( _fetching[ siteId ] ) {
				return;
			}
			_fetching[ siteId ] = true;

			setTimeout( () => {
				dispatch( {
					type: PLUGIN_SETUP_INSTRUCTIONS_FETCH,
					siteId,
				} );
			}, 1 );

			wpcom.undocumented().fetchJetpackKeys( siteId, ( error, data ) => {
				if ( error ) {
					dispatch( {
						type: PLUGIN_SETUP_INSTRUCTIONS_RECEIVE,
						siteId,
						data: [],
					} );
					return;
				}

				data = normalizePluginInstructions( data );

				dispatch( {
					type: PLUGIN_SETUP_INSTRUCTIONS_RECEIVE,
					siteId,
					data
				} );
			} );
		};
	},

	installPlugin: function( plugin, site ) {
		return ( dispatch ) => {
			// Starting Install
			dispatch( {
				type: PLUGIN_SETUP_INSTALL,
				siteId: site.ID,
				slug: plugin.slug,
			} );

			install( site, plugin, dispatch );
		};
	}
};
