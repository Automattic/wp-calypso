/**
* External dependencies
*/
const wpcom = require( 'lib/wp' ).undocumented();
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

function normalizePluginInstructions( data ) {
	const _plugins = data.keys;
	return keys( _plugins ).map( ( key ) => {
		const plugin = _plugins[key];
		return {
			slug: plugin.slug,
			name: plugin.name,
			key: plugin.key,
			status: {
				start: false,
				install: null,
				activate: null,
				config: null,
				done: false,
			},
			error: null,
		}
	} );
}

function install( site, plugin, dispatch ) {
	Dispatcher.handleViewAction( {
		type: 'INSTALL_PLUGIN',
		action: 'INSTALL_PLUGIN',
		site: site,
		plugin: plugin,
		data: null,
		error: null
	} );
	wpcom.pluginsInstall( site.ID, plugin.slug, ( error, data ) => {
		if ( error ) {
			if ( error.name === 'PluginAlreadyInstalledError' ) {
				update( site, plugin, dispatch );
			} else {
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
			return;
		}

		dispatch( {
			type: PLUGIN_SETUP_ACTIVATE,
			siteId: site.ID,
			slug: plugin.slug,
		} );

		activate( site, data, dispatch );
	} );
};

function update( site, plugin, dispatch ) {
	wpcom.pluginsUpdate( site.ID, plugin.id, ( error ) => {
		if ( error ) {
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
			return;
		}

		dispatch( {
			type: PLUGIN_SETUP_ACTIVATE,
			siteId: site.ID,
			slug: plugin.slug,
		} );

		activate( site, plugin, dispatch );
	} );
};

function activate( site, plugin, dispatch ) {
	wpcom.pluginsActivate( site.ID, plugin.id, ( error, data ) => {
		if ( error && error.name !== 'ActivationErrorError' ) {
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

			return;
		}

		if ( error && error.name === 'ActivationErrorError' ) {
			// Technically it failed, but we need the plugin info in `data`.
			data = plugin;
		}

		dispatch( {
			type: PLUGIN_SETUP_CONFIGURE,
			siteId: site.ID,
			slug: plugin.slug,
		} );
		Dispatcher.handleServerAction( {
			type: 'RECEIVE_INSTALLED_PLUGIN',
			action: 'INSTALL_PLUGIN',
			site: site,
			plugin: plugin,
			data: data,
			error: null
		} );

		autoupdate( site.ID, data );
		configure( site, data, dispatch );
	} );
};

function autoupdate( siteId, plugin ) {
	wpcom.enableAutoupdates( siteId, plugin.id );
};

function configure( site, plugin, dispatch ) {
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

			wpcom.fetchJetpackKeys( siteId, ( error, data ) => {
				if ( error ) {
					console.warn( error );
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
			setTimeout( () => {
				dispatch( {
					type: PLUGIN_SETUP_INSTALL,
					siteId: site.ID,
					slug: plugin.slug,
				} );
			}, 1 );

			install( site, plugin, dispatch );
		};
	}
}
