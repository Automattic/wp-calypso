/**
 * External dependencies
 */
const wpcom = require( 'lib/wp' );
import keys from 'lodash/keys';

/**
 * Internal dependencies
 */
import Dispatcher from 'dispatcher';
import versionCompare from 'lib/version-compare';
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
	return keys( _plugins ).map( ( slug ) => {
		const apiKey = _plugins[ slug ];
		return {
			slug: slug,
			name: slug,
			key: apiKey,
			status: 'wait',
			error: null,
		};
	} );
};

/**
 * Return a SitePlugin instance used to handle the plugin
 *
 * @param {Object} site - site object
 * @param {String} plugin - plugin identifier
 * @return {SitePlugin} SitePlugin instance
 */
const getPluginHandler = ( site, plugin ) => {
	const siteHandler = wpcom.site( site.ID );
	const pluginHandler = siteHandler.plugin( plugin );
	return pluginHandler;
};

function install( site, plugin, dispatch ) {
	Dispatcher.handleViewAction( {
		type: 'INSTALL_PLUGIN',
		action: 'INSTALL_PLUGIN',
		site: site,
		plugin: plugin,
		data: null,
		error: null
	} );

	if ( plugin.active ) {
		dispatch( {
			type: PLUGIN_SETUP_CONFIGURE,
			siteId: site.ID,
			slug: plugin.slug,
		} );
		configure( site, plugin, dispatch );
		return;
	}

	getPluginHandler( site, plugin.slug ).install().then( ( data ) => {
		dispatch( {
			type: PLUGIN_SETUP_ACTIVATE,
			siteId: site.ID,
			slug: plugin.slug,
		} );

		data.key = plugin.key;
		activate( site, data, dispatch );
	} ).catch( ( error ) => {
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
	} );
}

function update( site, plugin, dispatch ) {
	getPluginHandler( site, plugin.id ).updateVersion().then( ( data ) => {
		dispatch( {
			type: PLUGIN_SETUP_ACTIVATE,
			siteId: site.ID,
			slug: plugin.slug,
		} );

		data.key = plugin.key;
		activate( site, data, dispatch );
	} ).catch( ( error ) => {
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
		configure( site, plugin, dispatch );
	};

	getPluginHandler( site, plugin.id ).activate().then( success ).catch( ( error ) => {
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
	let option = false;
	switch ( plugin.slug ) {
		case 'vaultpress':
			option = 'vaultpress_auto_register';
			break;
		case 'akismet':
			option = 'wordpress_api_key';
			break;
		case 'polldaddy':
			option = 'polldaddy_api_key';
			break;
	}
	if ( ! option || ! plugin.key ) {
		const optionError = new Error( 'We can\'t configure this plugin.' );
		optionError.name = 'ConfigError';
		dispatch( {
			type: PLUGIN_SETUP_ERROR,
			siteId: site.ID,
			slug: plugin.slug,
			error: optionError,
		} );
		return;
	}
	let optionValue = plugin.key;
	// VP 1.8.4+ expects a different format for this option.
	if ( ( 'vaultpress' === plugin.slug ) && versionCompare( plugin.version, '1.8.3', '>' ) ) {
		optionValue = JSON.stringify( {
			key: plugin.key,
			action: 'register',
		} );
	}
	site.setOption( { option_name: option, option_value: optionValue }, ( error, data ) => {
		if ( ( 'vaultpress' === plugin.slug ) && versionCompare( plugin.version, '1.8.3', '>' ) ) {
			const response = JSON.parse( data.option_value );
			if ( 'response' === response.action && 'broken' === response.status ) {
				error = new Error( response.error );
				error.name = 'RegisterError';
			}
		}
		if ( error ) {
			dispatch( {
				type: PLUGIN_SETUP_ERROR,
				siteId: site.ID,
				slug: plugin.slug,
				error,
			} );
		}
		dispatch( {
			type: PLUGIN_SETUP_FINISH,
			siteId: site.ID,
			slug: plugin.slug,
		} );
	} );
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
