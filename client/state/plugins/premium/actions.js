/**
 * External dependencies
 */

import wpcom from 'lib/wp';
import { get, keys } from 'lodash';

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
	PLUGIN_SETUP_ERROR,
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
 * @param {object} site - site object
 * @param {string} plugin - plugin identifier
 * @returns {SitePlugin} SitePlugin instance
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
		error: null,
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

	getPluginHandler( site, plugin.slug )
		.install()
		.then( ( data ) => {
			dispatch( {
				type: PLUGIN_SETUP_ACTIVATE,
				siteId: site.ID,
				slug: plugin.slug,
			} );

			data.key = plugin.key;
			activate( site, data, dispatch );
		} )
		.catch( ( error ) => {
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
					error: error,
				} );
			}
		} );
}

function update( site, plugin, dispatch ) {
	getPluginHandler( site, plugin.id )
		.updateVersion()
		.then( ( data ) => {
			dispatch( {
				type: PLUGIN_SETUP_ACTIVATE,
				siteId: site.ID,
				slug: plugin.slug,
			} );

			data.key = plugin.key;
			activate( site, data, dispatch );
		} )
		.catch( ( error ) => {
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
				error: error,
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
			error: null,
		} );

		autoupdate( site, data );
		configure( site, plugin, dispatch );
	};

	getPluginHandler( site, plugin.id )
		.activate()
		.then( success )
		.catch( ( error ) => {
			if ( error.name === 'ActivationErrorError' || error.name === 'ActivationError' ) {
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
				error: error,
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
	}
	if ( ! option || ! plugin.key ) {
		const optionError = new Error( "We can't configure this plugin." );
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
	if ( 'vaultpress' === plugin.slug && versionCompare( plugin.version, '1.8.3', '>' ) ) {
		optionValue = JSON.stringify( {
			key: plugin.key,
			action: 'register',
		} );
	}

	const saveOption = () => {
		const query = {
			option_name: option,
			option_value: optionValue,
			site_option: false,
			is_array: false,
		};

		return wpcom
			.undocumented()
			.site( site.ID )
			.setOption( query, ( error, data ) => {
				if (
					! error &&
					'vaultpress' === plugin.slug &&
					versionCompare( plugin.version, '1.8.3', '>' )
				) {
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
	};

	// We don't need to check for VaultPress
	if ( 'vaultpress' === plugin.slug ) {
		return saveOption();
	}

	return wpcom
		.undocumented()
		.site( site.ID )
		.getOption( { option_name: option }, ( getError, getData ) => {
			if ( get( getData, 'option_value' ) === optionValue ) {
				// Already registered with this key
				dispatch( {
					type: PLUGIN_SETUP_FINISH,
					siteId: site.ID,
					slug: plugin.slug,
				} );
				return;
			} else if ( getData.option_value ) {
				// Already registered with another key
				const alreadyRegistered = new Error();
				alreadyRegistered.code = 'already_registered';
				dispatch( {
					type: PLUGIN_SETUP_ERROR,
					siteId: site.ID,
					slug: plugin.slug,
					error: alreadyRegistered,
				} );
				return;
			}
			return saveOption();
		} );
}

export function fetchInstallInstructions( siteId ) {
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
				data,
			} );
		} );
	};
}

export function installPlugin( plugin, site ) {
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
