/**
 * External dependencies
 */

import wpcom from 'lib/wp';

/**
 * Internal dependencies
 */
import {
	PLUGINS_RECEIVE,
	PLUGINS_REQUEST,
	PLUGINS_REQUEST_SUCCESS,
	PLUGINS_REQUEST_FAILURE,
	PLUGIN_ACTIVATE_REQUEST,
	PLUGIN_ACTIVATE_REQUEST_SUCCESS,
	PLUGIN_ACTIVATE_REQUEST_FAILURE,
	PLUGIN_DEACTIVATE_REQUEST,
	PLUGIN_DEACTIVATE_REQUEST_SUCCESS,
	PLUGIN_DEACTIVATE_REQUEST_FAILURE,
	PLUGIN_UPDATE_REQUEST,
	PLUGIN_UPDATE_REQUEST_SUCCESS,
	PLUGIN_UPDATE_REQUEST_FAILURE,
	PLUGIN_AUTOUPDATE_ENABLE_REQUEST,
	PLUGIN_AUTOUPDATE_ENABLE_REQUEST_SUCCESS,
	PLUGIN_AUTOUPDATE_ENABLE_REQUEST_FAILURE,
	PLUGIN_AUTOUPDATE_DISABLE_REQUEST,
	PLUGIN_AUTOUPDATE_DISABLE_REQUEST_SUCCESS,
	PLUGIN_AUTOUPDATE_DISABLE_REQUEST_FAILURE,
	PLUGIN_INSTALL_REQUEST,
	PLUGIN_INSTALL_REQUEST_SUCCESS,
	PLUGIN_INSTALL_REQUEST_FAILURE,
	PLUGIN_REMOVE_REQUEST,
	PLUGIN_REMOVE_REQUEST_SUCCESS,
	PLUGIN_REMOVE_REQUEST_FAILURE,
} from 'state/action-types';
import {
	ACTIVATE_PLUGIN,
	DEACTIVATE_PLUGIN,
	UPDATE_PLUGIN,
	ENABLE_AUTOUPDATE_PLUGIN,
	DISABLE_AUTOUPDATE_PLUGIN,
	INSTALL_PLUGIN,
	REMOVE_PLUGIN,
} from './constants';

/**
 * Return a SitePlugin instance used to handle the plugin
 *
 * @param {object} siteId - site ID
 * @param {string} pluginId - plugin identifier
 * @returns {SitePlugin} SitePlugin instance
 */
const getPluginHandler = ( siteId, pluginId ) => {
	const siteHandler = wpcom.site( siteId );
	return siteHandler.plugin( pluginId );
};

export function activatePlugin( siteId, plugin ) {
	return ( dispatch ) => {
		const pluginId = plugin.id;
		const defaultAction = {
			action: ACTIVATE_PLUGIN,
			siteId,
			pluginId,
		};
		dispatch( { ...defaultAction, type: PLUGIN_ACTIVATE_REQUEST } );

		const successCallback = ( data ) => {
			dispatch( { ...defaultAction, type: PLUGIN_ACTIVATE_REQUEST_SUCCESS, data } );
		};

		const errorCallback = ( error ) => {
			// This error means it's already active.
			if ( error && error.error === 'activation_error' ) {
				successCallback( plugin );
			}
			dispatch( { ...defaultAction, type: PLUGIN_ACTIVATE_REQUEST_FAILURE, error } );
		};

		return getPluginHandler( siteId, pluginId )
			.activate()
			.then( successCallback )
			.catch( errorCallback );
	};
}

export function deactivatePlugin( siteId, plugin ) {
	return ( dispatch ) => {
		const pluginId = plugin.id;
		const defaultAction = {
			action: DEACTIVATE_PLUGIN,
			siteId,
			pluginId,
		};
		dispatch( { ...defaultAction, type: PLUGIN_DEACTIVATE_REQUEST } );

		const successCallback = ( data ) => {
			dispatch( { ...defaultAction, type: PLUGIN_DEACTIVATE_REQUEST_SUCCESS, data } );
		};

		const errorCallback = ( error ) => {
			// This error means it's already inactive.
			if ( error && error.error === 'deactivation_error' ) {
				successCallback( plugin );
			}
			dispatch( { ...defaultAction, type: PLUGIN_DEACTIVATE_REQUEST_FAILURE, error } );
		};

		return getPluginHandler( siteId, pluginId )
			.deactivate()
			.then( successCallback )
			.catch( errorCallback );
	};
}

export function updatePlugin( siteId, plugin ) {
	return ( dispatch ) => {
		if ( ! plugin.update ) {
			return Promise.reject( 'Error: Plugin already up-to-date.' );
		}

		const pluginId = plugin.id;
		const defaultAction = {
			action: UPDATE_PLUGIN,
			siteId,
			pluginId,
		};
		dispatch( { ...defaultAction, type: PLUGIN_UPDATE_REQUEST } );

		const successCallback = ( data ) => {
			dispatch( { ...defaultAction, type: PLUGIN_UPDATE_REQUEST_SUCCESS, data } );
		};

		const errorCallback = ( error ) => {
			dispatch( { ...defaultAction, type: PLUGIN_UPDATE_REQUEST_FAILURE, error } );
		};

		return getPluginHandler( siteId, pluginId )
			.updateVersion()
			.then( successCallback )
			.catch( errorCallback );
	};
}

export function enableAutoupdatePlugin( siteId, plugin ) {
	return ( dispatch ) => {
		const pluginId = plugin.id;
		const defaultAction = {
			action: ENABLE_AUTOUPDATE_PLUGIN,
			siteId,
			pluginId,
		};
		dispatch( { ...defaultAction, type: PLUGIN_AUTOUPDATE_ENABLE_REQUEST } );

		const successCallback = ( data ) => {
			dispatch( { ...defaultAction, type: PLUGIN_AUTOUPDATE_ENABLE_REQUEST_SUCCESS, data } );
			if ( data.update ) {
				updatePlugin( siteId, data )( dispatch );
			}
		};

		const errorCallback = ( error ) => {
			dispatch( { ...defaultAction, type: PLUGIN_AUTOUPDATE_ENABLE_REQUEST_FAILURE, error } );
		};

		return getPluginHandler( siteId, pluginId )
			.enableAutoupdate()
			.then( successCallback )
			.catch( errorCallback );
	};
}

export function disableAutoupdatePlugin( siteId, plugin ) {
	return ( dispatch ) => {
		const pluginId = plugin.id;
		const defaultAction = {
			action: DISABLE_AUTOUPDATE_PLUGIN,
			siteId,
			pluginId,
		};
		dispatch( { ...defaultAction, type: PLUGIN_AUTOUPDATE_DISABLE_REQUEST } );

		const successCallback = ( data ) => {
			dispatch( { ...defaultAction, type: PLUGIN_AUTOUPDATE_DISABLE_REQUEST_SUCCESS, data } );
		};

		const errorCallback = ( error ) => {
			dispatch( { ...defaultAction, type: PLUGIN_AUTOUPDATE_DISABLE_REQUEST_FAILURE, error } );
		};

		return getPluginHandler( siteId, pluginId )
			.disableAutoupdate()
			.then( successCallback )
			.catch( errorCallback );
	};
}

function installPluginHelper( siteId, plugin, isMainNetworkSite = false ) {
	return ( dispatch ) => {
		const pluginId = plugin.id;
		const defaultAction = {
			action: INSTALL_PLUGIN,
			siteId,
			pluginId,
		};
		dispatch( { ...defaultAction, type: PLUGIN_INSTALL_REQUEST } );

		const doInstall = function ( pluginData ) {
			return getPluginHandler( siteId, pluginData.slug ).install();
		};

		const doActivate = function ( pluginData ) {
			return getPluginHandler( siteId, pluginData.id ).activate();
		};

		const doUpdate = function ( pluginData ) {
			return getPluginHandler( siteId, pluginData.id ).updateVersion();
		};

		const doAutoupdates = function ( pluginData ) {
			return getPluginHandler( siteId, pluginData.id ).enableAutoupdate();
		};

		const successCallback = ( data ) => {
			dispatch( { ...defaultAction, type: PLUGIN_INSTALL_REQUEST_SUCCESS, data } );
		};

		const errorCallback = ( error ) => {
			if ( error.name === 'PluginAlreadyInstalledError' ) {
				if ( isMainNetworkSite ) {
					return doUpdate( plugin )
						.then( doAutoupdates )
						.then( successCallback )
						.catch( errorCallback );
				}
				return doUpdate( plugin )
					.then( doActivate )
					.then( doAutoupdates )
					.then( successCallback )
					.catch( errorCallback );
			}
			if ( error.name === 'ActivationErrorError' ) {
				return doUpdate( plugin )
					.then( doAutoupdates )
					.then( successCallback )
					.catch( errorCallback );
			}
			dispatch( { ...defaultAction, type: PLUGIN_INSTALL_REQUEST_FAILURE, error } );
			return Promise.reject( error );
		};

		if ( isMainNetworkSite ) {
			return doInstall( plugin )
				.then( doAutoupdates )
				.then( successCallback )
				.catch( errorCallback );
		}

		return doInstall( plugin )
			.then( doActivate )
			.then( doAutoupdates )
			.then( successCallback )
			.catch( errorCallback );
	};
}

export function installPlugin( siteId, plugin ) {
	return installPluginHelper( siteId, plugin );
}

export function installPluginOnMultisite( siteId, plugin ) {
	return installPluginHelper( siteId, plugin, true );
}

export function removePlugin( siteId, plugin ) {
	return ( dispatch ) => {
		const pluginId = plugin.id;
		const defaultAction = {
			action: REMOVE_PLUGIN,
			siteId,
			pluginId,
		};
		dispatch( { ...defaultAction, type: PLUGIN_REMOVE_REQUEST } );

		const doDeactivate = function ( pluginData ) {
			if ( pluginData.active ) {
				return getPluginHandler( siteId, pluginData.id ).deactivate();
			}
			return Promise.resolve( pluginData );
		};

		const doDisableAutoupdate = function ( pluginData ) {
			if ( pluginData.autoupdate ) {
				return getPluginHandler( siteId, pluginData.id ).disableAutoupdate();
			}
			return Promise.resolve( pluginData );
		};

		const doRemove = function ( pluginData ) {
			return getPluginHandler( siteId, pluginData.id ).delete();
		};

		const successCallback = () => {
			dispatch( { ...defaultAction, type: PLUGIN_REMOVE_REQUEST_SUCCESS } );
		};

		const errorCallback = ( error ) => {
			dispatch( { ...defaultAction, type: PLUGIN_REMOVE_REQUEST_FAILURE, error } );
			return Promise.reject( error );
		};

		return doDeactivate( plugin )
			.then( doDisableAutoupdate )
			.then( doRemove )
			.then( successCallback )
			.catch( errorCallback );
	};
}

export function fetchPlugins( siteIds ) {
	return ( dispatch ) => {
		return siteIds.map( ( siteId ) => {
			const defaultAction = {
				siteId,
			};
			dispatch( { ...defaultAction, type: PLUGINS_REQUEST } );

			const receivePluginsDispatchSuccess = ( data ) => {
				dispatch( { ...defaultAction, type: PLUGINS_RECEIVE, data: data.plugins } );
				dispatch( { ...defaultAction, type: PLUGINS_REQUEST_SUCCESS } );

				data.plugins.map( ( plugin ) => {
					if ( plugin.update && plugin.autoupdate ) {
						updatePlugin( siteId, plugin )( dispatch );
					}
				} );
			};

			const receivePluginsDispatchFail = ( error ) => {
				dispatch( { ...defaultAction, type: PLUGINS_REQUEST_FAILURE, error } );
			};

			return wpcom
				.site( siteId )
				.pluginsList()
				.then( receivePluginsDispatchSuccess )
				.catch( receivePluginsDispatchFail );
		} );
	};
}
