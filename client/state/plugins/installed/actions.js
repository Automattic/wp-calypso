/**
 * Internal dependencies
 */
import wpcom from 'calypso/lib/wp';
import getNetworkSites from 'calypso/state/selectors/get-network-sites';
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
} from 'calypso/state/action-types';
import {
	ACTIVATE_PLUGIN,
	DEACTIVATE_PLUGIN,
	UPDATE_PLUGIN,
	ENABLE_AUTOUPDATE_PLUGIN,
	DISABLE_AUTOUPDATE_PLUGIN,
	INSTALL_PLUGIN,
	REMOVE_PLUGIN,
} from 'calypso/lib/plugins/constants';
import { getSite } from 'calypso/state/sites/selectors';
import { bumpStat, recordTracksEvent } from 'calypso/state/analytics/actions';
import { canCurrentUser } from 'calypso/state/selectors/can-current-user';
import { sitePluginUpdated } from 'calypso/state/sites/actions';

import 'calypso/state/plugins/init';

/**
 * Return a SitePlugin instance used to handle the plugin
 *
 * @param {object} siteId - site ID
 * @param {string} pluginId - plugin identifier
 * @returns {any} SitePlugin instance
 */
const getPluginHandler = ( siteId, pluginId ) => {
	const siteHandler = wpcom.site( siteId );
	return siteHandler.plugin( pluginId );
};

/**
 * Helper thunk for recording tracks events and bumping stats for plugin events.
 * Useful to record events and bump stats by following a certain naming pattern.
 *
 * @param {string} eventType The type of event
 * @param {object} plugin    The plugin object
 * @param {number} siteId    ID of the site
 * @param {object} error     Error object
 * @returns {Function}       Action thunk
 */
const recordEvent = ( eventType, plugin, siteId, error ) => {
	return ( dispatch ) => {
		if ( error ) {
			dispatch(
				recordTracksEvent( eventType + '_error', {
					site: siteId,
					plugin: plugin.slug,
					error: error.error,
				} )
			);
			dispatch( bumpStat( eventType, 'failed' ) );
			return;
		}
		dispatch(
			recordTracksEvent( eventType + '_success', {
				site: siteId,
				plugin: plugin.slug,
			} )
		);
		dispatch( bumpStat( eventType, 'succeeded' ) );
	};
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

		const afterActivationCallback = ( error, data ) => {
			// Sometime data can be empty or the plugin always
			// return the active state even when the error is empty.
			// Activation error is ok, because it means the plugin is already active
			if (
				( error && error.error !== 'activation_error' ) ||
				( ! ( data && data.active ) && ! error )
			) {
				dispatch( bumpStat( 'calypso_plugin_activated', 'failed' ) );
				dispatch(
					recordTracksEvent( 'calypso_plugin_activated_error', {
						error: error && error.error ? error.error : 'Undefined activation error',
						site: siteId,
						plugin: plugin.slug,
					} )
				);

				return;
			}

			dispatch( bumpStat( 'calypso_plugin_activated', 'succeeded' ) );
			dispatch(
				recordTracksEvent( 'calypso_plugin_activated_success', {
					site: siteId,
					plugin: plugin.slug,
				} )
			);
		};

		const successCallback = ( data ) => {
			dispatch( { ...defaultAction, type: PLUGIN_ACTIVATE_REQUEST_SUCCESS, data } );

			afterActivationCallback( undefined, data );
		};

		const errorCallback = ( error ) => {
			// This error means it's already active.
			if ( error && error.error === 'activation_error' ) {
				successCallback( plugin );
			}
			dispatch( { ...defaultAction, type: PLUGIN_ACTIVATE_REQUEST_FAILURE, error } );

			afterActivationCallback( error, undefined );
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

		const afterDeactivationCallback = ( error ) => {
			// Sometime data can be empty or the plugin always
			// return the active state even when the error is empty.
			// Activation error is ok, because it means the plugin is already active
			if ( error && error.error !== 'deactivation_error' ) {
				dispatch( bumpStat( 'calypso_plugin_deactivated', 'failed' ) );
				dispatch(
					recordTracksEvent( 'calypso_plugin_deactivated_error', {
						error: error.error ? error.error : 'Undefined deactivation error',
						site: siteId,
						plugin: plugin.slug,
					} )
				);

				return;
			}
			dispatch( bumpStat( 'calypso_plugin_deactivated', 'succeeded' ) );
			dispatch(
				recordTracksEvent( 'calypso_plugin_deactivated_success', {
					site: siteId,
					plugin: plugin.slug,
				} )
			);
		};

		const successCallback = ( data ) => {
			dispatch( { ...defaultAction, type: PLUGIN_DEACTIVATE_REQUEST_SUCCESS, data } );
			afterDeactivationCallback( undefined );
		};

		const errorCallback = ( error ) => {
			// This error means it's already inactive.
			if ( error && error.error === 'deactivation_error' ) {
				successCallback( plugin );
			}
			dispatch( { ...defaultAction, type: PLUGIN_DEACTIVATE_REQUEST_FAILURE, error } );
			afterDeactivationCallback( error );
		};

		return getPluginHandler( siteId, pluginId )
			.deactivate()
			.then( successCallback )
			.catch( errorCallback );
	};
}

export function togglePluginActivation( siteId, plugin ) {
	return ( dispatch, getState ) => {
		if ( ! canCurrentUser( getState(), siteId, 'manage_options' ) ) {
			return;
		}

		if ( ! plugin.active ) {
			dispatch( activatePlugin( siteId, plugin ) );
		} else {
			dispatch( deactivatePlugin( siteId, plugin ) );
		}
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

		const afterUpdateCallback = ( error ) => {
			dispatch( recordEvent( 'calypso_plugin_updated', plugin, siteId, error ) );
		};

		const successCallback = ( data ) => {
			dispatch( { ...defaultAction, type: PLUGIN_UPDATE_REQUEST_SUCCESS, data } );
			afterUpdateCallback( undefined );
			sitePluginUpdated( siteId );
		};

		const errorCallback = ( error ) => {
			dispatch( { ...defaultAction, type: PLUGIN_UPDATE_REQUEST_FAILURE, error } );
			afterUpdateCallback( error );
		};

		return getPluginHandler( siteId, pluginId )
			.updateVersion()
			.then( successCallback )
			.catch( errorCallback );
	};
}

export function enableAutoupdatePlugin( siteId, plugin ) {
	return ( dispatch, getState ) => {
		const pluginId = plugin.id;
		const defaultAction = {
			action: ENABLE_AUTOUPDATE_PLUGIN,
			siteId,
			pluginId,
		};

		dispatch( { ...defaultAction, type: PLUGIN_AUTOUPDATE_ENABLE_REQUEST } );

		const afterEnableAutoupdateCallback = ( error ) => {
			recordEvent( 'calypso_plugin_autoupdate_enabled', plugin, siteId, error );
		};

		const successCallback = ( data ) => {
			dispatch( { ...defaultAction, type: PLUGIN_AUTOUPDATE_ENABLE_REQUEST_SUCCESS, data } );
			afterEnableAutoupdateCallback( undefined );
			if ( data.update ) {
				updatePlugin( siteId, data )( dispatch, getState );
			}
		};

		const errorCallback = ( error ) => {
			dispatch( { ...defaultAction, type: PLUGIN_AUTOUPDATE_ENABLE_REQUEST_FAILURE, error } );
			afterEnableAutoupdateCallback( error );
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

		const afterDisableAutoupdateCallback = ( error ) => {
			recordEvent( 'calypso_plugin_autoupdate_disabled', plugin, siteId, error );
		};

		const successCallback = ( data ) => {
			dispatch( { ...defaultAction, type: PLUGIN_AUTOUPDATE_DISABLE_REQUEST_SUCCESS, data } );
			afterDisableAutoupdateCallback( undefined );
		};

		const errorCallback = ( error ) => {
			dispatch( { ...defaultAction, type: PLUGIN_AUTOUPDATE_DISABLE_REQUEST_FAILURE, error } );
			afterDisableAutoupdateCallback( error );
		};

		return getPluginHandler( siteId, pluginId )
			.disableAutoupdate()
			.then( successCallback )
			.catch( errorCallback );
	};
}

export function togglePluginAutoUpdate( siteId, plugin ) {
	return ( dispatch, getState ) => {
		const state = getState();
		const site = getSite( state, siteId );
		const canManage = canCurrentUser( state, siteId, 'manage_options' );

		if ( ! canManage || ! site.canAutoupdateFiles ) {
			return;
		}

		if ( ! plugin.autoupdate ) {
			dispatch( enableAutoupdatePlugin( siteId, plugin ) );
		} else {
			dispatch( disableAutoupdatePlugin( siteId, plugin ) );
		}
	};
}

function refreshNetworkSites( siteId ) {
	return ( dispatch, getState ) => {
		const state = getState();
		const networkSites = getNetworkSites( state, siteId );
		if ( networkSites ) {
			networkSites.forEach( ( networkSite ) => dispatch( fetchSitePlugins( networkSite.ID ) ) );
		}
	};
}

function installPluginHelper( siteId, plugin, isMainNetworkSite = false ) {
	return ( dispatch, getState ) => {
		const state = getState();
		const site = getSite( state, siteId );
		const pluginId = plugin.id || plugin.slug;
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

		const recordInstallPluginEvent = ( type, error ) => {
			if ( INSTALL_PLUGIN === type ) {
				return;
			}
			recordEvent( 'calypso_plugin_installed', plugin, site, error );
		};

		const successCallback = ( data ) => {
			dispatch( { ...defaultAction, type: PLUGIN_INSTALL_REQUEST_SUCCESS, data } );
			recordInstallPluginEvent( 'RECEIVE_INSTALLED_PLUGIN' );
			refreshNetworkSites( siteId );
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
			recordInstallPluginEvent( 'RECEIVE_INSTALLED_PLUGIN', error );
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
	return ( dispatch, getState ) => {
		const state = getState();
		const site = getSite( state, siteId );
		const pluginId = plugin.id || plugin.slug;
		const defaultAction = {
			action: REMOVE_PLUGIN,
			siteId,
			pluginId,
		};
		dispatch( { ...defaultAction, type: PLUGIN_REMOVE_REQUEST } );

		const recordRemovePluginEvent = ( type, error ) => {
			recordEvent( 'calypso_plugin_removed', plugin, site, error );
		};

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
			recordRemovePluginEvent( 'RECEIVE_REMOVE_PLUGIN' );
			refreshNetworkSites( siteId );
		};

		const errorCallback = ( error ) => {
			dispatch( { ...defaultAction, type: PLUGIN_REMOVE_REQUEST_FAILURE, error } );
			recordRemovePluginEvent( 'RECEIVE_REMOVE_PLUGIN', error );
			return Promise.reject( error );
		};

		return doDeactivate( plugin )
			.then( doDisableAutoupdate )
			.then( doRemove )
			.then( successCallback )
			.catch( errorCallback );
	};
}

export function receiveSitePlugins( siteId, plugins ) {
	return {
		type: PLUGINS_RECEIVE,
		data: plugins,
		siteId,
	};
}

export function fetchSitePlugins( siteId ) {
	return ( dispatch, getState ) => {
		const defaultAction = {
			siteId,
		};
		dispatch( { ...defaultAction, type: PLUGINS_REQUEST } );

		const receivePluginsDispatchSuccess = ( data ) => {
			dispatch( receiveSitePlugins( siteId, data.plugins ) );
			dispatch( { ...defaultAction, type: PLUGINS_REQUEST_SUCCESS } );

			data.plugins.map( ( plugin ) => {
				if ( plugin.update && plugin.autoupdate ) {
					updatePlugin( siteId, plugin )( dispatch, getState );
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
	};
}

export function fetchPlugins( siteIds ) {
	return ( dispatch ) => siteIds.map( ( siteId ) => dispatch( fetchSitePlugins( siteId ) ) );
}
