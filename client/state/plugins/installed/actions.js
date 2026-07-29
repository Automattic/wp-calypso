import { translate } from 'i18n-calypso';
import {
	ACTIVATE_PLUGIN,
	DEACTIVATE_PLUGIN,
	UPDATE_PLUGIN,
	ENABLE_AUTOUPDATE_PLUGIN,
	DISABLE_AUTOUPDATE_PLUGIN,
	INSTALL_PLUGIN,
	REMOVE_PLUGIN,
} from 'calypso/lib/plugins/constants';
import wpcom from 'calypso/lib/wp';
import {
	PLUGINS_RECEIVE,
	PLUGINS_REQUEST,
	PLUGINS_REQUEST_SUCCESS,
	PLUGINS_REQUEST_FAILURE,
	PLUGINS_ALL_RECEIVE,
	PLUGINS_ALL_REQUEST,
	PLUGINS_ALL_REQUEST_SUCCESS,
	PLUGINS_ALL_REQUEST_FAILURE,
	PLUGIN_ACTIVATE_REQUEST,
	PLUGIN_ACTIVATE_REQUEST_SUCCESS,
	PLUGIN_ACTIVATE_REQUEST_FAILURE,
	PLUGIN_DEACTIVATE_REQUEST,
	PLUGIN_DEACTIVATE_REQUEST_SUCCESS,
	PLUGIN_DEACTIVATE_REQUEST_FAILURE,
	PLUGIN_UPDATE_REQUEST,
	PLUGIN_UPDATE_REQUEST_SUCCESS,
	PLUGIN_UPDATE_REQUEST_FAILURE,
	PLUGIN_ALREADY_UP_TO_DATE,
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
	PLUGIN_ACTION_STATUS_UPDATE,
	PLUGIN_INSTALL_REQUEST_PARTIAL_SUCCESS,
} from 'calypso/state/action-types';
import { bumpStat, recordTracksEvent } from 'calypso/state/analytics/actions';
import { errorNotice } from 'calypso/state/notices/actions';
import { canCurrentUser } from 'calypso/state/selectors/can-current-user';
import getNetworkSites from 'calypso/state/selectors/get-network-sites';
import { sitePluginUpdated } from 'calypso/state/sites/actions';
import { getSite } from 'calypso/state/sites/selectors';

import 'calypso/state/plugins/init';

/**
 * Determines the truthiness of a site specific property regardless of whether it is on the plugin object
 * or on one of the plugin's site objects.
 * @param {string} prop - The site property to check. One of 'active', 'autoupdate', 'update', or 'version'.
 * @param {Object} plugin - The plugin object
 * @param {number} siteId - The ID of the site
 * @returns {boolean} True if the plugin object has the prop, false otherwise.
 */
const pluginHasTruthySiteProp = ( prop, plugin, siteId ) => {
	if ( ! [ 'active', 'autoupdate', 'update', 'version' ].includes( prop ) ) {
		throw new Error( `${ prop } is not a site property.` );
	}

	return !! ( plugin.hasOwnProperty( prop )
		? plugin[ prop ]
		: siteId && plugin.sites?.[ siteId ]?.[ prop ] );
};

/**
 * Return a SitePlugin instance used to handle the plugin
 * @param {Object} siteId - site ID
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
 * @param {string} eventType The type of event
 * @param {Object} plugin    The plugin object
 * @param {number} siteId    ID of the site
 * @param {Object} error     Error object
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

/**
 * Function to dispatch actions to set the statusRecentlyChanged value based on the type.
 * First, dispatch the action to set statusRecentlyChanged to true.
 * Next, dispatch the action to set the statusRecentlyChanged to false with delay(setTimeout).
 * Used to show the plugin status before the plugin is filtered based on the status.
 * The idea here is to filter the plugins also when statusRecentlyChanged is true.
 * @param {Object} defaultAction The default action params
 * @param {Object} data   The API response
 * @returns {Function}    The dispatch actions
 */
export const handleDispatchSuccessCallback = ( defaultAction, data ) => ( dispatch ) => {
	dispatch( {
		...defaultAction,
		type: PLUGIN_ACTION_STATUS_UPDATE,
		data: { ...data, statusRecentlyChanged: true },
	} );
	setTimeout( () => {
		dispatch( {
			...defaultAction,
			type: PLUGIN_ACTION_STATUS_UPDATE,
			data: { ...data, statusRecentlyChanged: false },
		} );
	}, 3000 );
};

export function activatePlugin( siteId, plugin ) {
	return ( dispatch ) => {
		const pluginId = plugin.id;
		const defaultAction = {
			action: ACTIVATE_PLUGIN,
			siteId,
			pluginId,
		};

		if ( pluginHasTruthySiteProp( 'active', plugin, siteId ) ) {
			return dispatch( { ...defaultAction, type: PLUGIN_ACTIVATE_REQUEST_SUCCESS, data: plugin } );
		}

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
			dispatch( handleDispatchSuccessCallback( defaultAction, data ) );
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

		if ( ! pluginHasTruthySiteProp( 'active', plugin, siteId ) ) {
			return dispatch( {
				...defaultAction,
				type: PLUGIN_DEACTIVATE_REQUEST_SUCCESS,
				data: plugin,
			} );
		}

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
			dispatch( handleDispatchSuccessCallback( defaultAction, data ) );
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

		if ( ! pluginHasTruthySiteProp( 'active', plugin, siteId ) ) {
			dispatch( activatePlugin( siteId, plugin ) );
		} else {
			dispatch( deactivatePlugin( siteId, plugin ) );
		}
	};
}

export function updatePlugin( siteId, plugin ) {
	return async ( dispatch ) => {
		const pluginId = plugin.id;
		const defaultAction = {
			action: UPDATE_PLUGIN,
			siteId,
			pluginId,
		};

		if (
			! pluginHasTruthySiteProp( 'update', plugin, siteId ) ||
			( siteId && plugin?.sites?.[ siteId ]?.update?.recentlyUpdated )
		) {
			dispatch( { ...defaultAction, type: PLUGIN_ALREADY_UP_TO_DATE, data: plugin } );
			return;
		}

		dispatch( { ...defaultAction, type: PLUGIN_UPDATE_REQUEST } );

		try {
			const data = await getPluginHandler( siteId, pluginId ).updateVersion();
			dispatch( { ...defaultAction, type: PLUGIN_UPDATE_REQUEST_SUCCESS, data } );
			dispatch( handleDispatchSuccessCallback( defaultAction, data ) );
			dispatch( recordEvent( 'calypso_plugin_updated', plugin, siteId ) );
			dispatch( sitePluginUpdated( siteId ) );
		} catch ( error ) {
			dispatch( { ...defaultAction, type: PLUGIN_UPDATE_REQUEST_FAILURE, error } );
			dispatch( recordEvent( 'calypso_plugin_updated', plugin, siteId, error ) );
		}
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

		if ( pluginHasTruthySiteProp( 'autoupdate', plugin, siteId ) ) {
			return dispatch( {
				...defaultAction,
				type: PLUGIN_AUTOUPDATE_ENABLE_REQUEST_SUCCESS,
				data: plugin,
			} );
		}

		dispatch( { ...defaultAction, type: PLUGIN_AUTOUPDATE_ENABLE_REQUEST } );

		const afterEnableAutoupdateCallback = ( error ) => {
			dispatch( recordEvent( 'calypso_plugin_autoupdate_enabled', plugin, siteId, error ) );
		};

		const successCallback = ( data ) => {
			dispatch( { ...defaultAction, type: PLUGIN_AUTOUPDATE_ENABLE_REQUEST_SUCCESS, data } );
			afterEnableAutoupdateCallback( undefined );
			if ( pluginHasTruthySiteProp( 'update', data, siteId ) ) {
				updatePlugin( siteId, data )( dispatch );
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

		if ( ! pluginHasTruthySiteProp( 'autoupdate', plugin, siteId ) ) {
			return dispatch( {
				...defaultAction,
				type: PLUGIN_AUTOUPDATE_DISABLE_REQUEST_SUCCESS,
				data: { ...plugin },
			} );
		}

		dispatch( { ...defaultAction, type: PLUGIN_AUTOUPDATE_DISABLE_REQUEST } );

		const afterDisableAutoupdateCallback = ( error ) => {
			dispatch( recordEvent( 'calypso_plugin_autoupdate_disabled', plugin, siteId, error ) );
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

		if ( ! pluginHasTruthySiteProp( 'autoupdate', plugin, siteId ) ) {
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

function installPluginHelper(
	siteId,
	plugin,
	isMainNetworkSite = false,
	shouldActivatePlugin = true
) {
	return ( dispatch ) => {
		const pluginId = plugin.id || plugin.slug;
		const defaultAction = {
			action: INSTALL_PLUGIN,
			siteId,
			pluginId,
		};
		dispatch( { ...defaultAction, type: PLUGIN_INSTALL_REQUEST } );

		let lastStep = '';

		const doInstall = function ( pluginData ) {
			lastStep = 'doInstall';
			return getPluginHandler( siteId, pluginData.slug ).install();
		};

		const doActivate = function ( pluginData ) {
			lastStep = 'doActivate';
			return getPluginHandler( siteId, pluginData.id ).activate();
		};

		const doUpdate = function ( pluginData ) {
			lastStep = 'doUpdate';
			return getPluginHandler( siteId, pluginData.id ).updateVersion();
		};

		const doAutoupdates = function ( pluginData ) {
			lastStep = 'doAutoupdates';
			return getPluginHandler( siteId, pluginData.id ).enableAutoupdate();
		};

		const recordInstallPluginEvent = ( type, error ) => {
			if ( INSTALL_PLUGIN === type ) {
				return;
			}
			dispatch( recordEvent( 'calypso_plugin_installed', plugin, siteId, error ) );
		};

		const successCallback = ( data ) => {
			dispatch( { ...defaultAction, type: PLUGIN_INSTALL_REQUEST_SUCCESS, data } );
			dispatch( handleDispatchSuccessCallback( defaultAction, data ) );
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
			let type = PLUGIN_INSTALL_REQUEST_FAILURE;
			let data = {};
			// If the error is a ServerError, the plugin was installed but not activated
			if ( error.name === 'ServerError' && lastStep === 'doActivate' ) {
				type = PLUGIN_INSTALL_REQUEST_PARTIAL_SUCCESS;
				error.error = 'server_error_during_activation';
				data = { ...plugin, active: false };
			}
			dispatch( { ...defaultAction, type, error, data } );
			recordInstallPluginEvent( 'RECEIVE_INSTALLED_PLUGIN', error );
			return Promise.reject( error );
		};

		if ( isMainNetworkSite || ! shouldActivatePlugin ) {
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

export function installPlugin( siteId, plugin, shouldActivatePlugin = true ) {
	return installPluginHelper( siteId, plugin, false, shouldActivatePlugin );
}

export function removePlugin( siteId, plugin ) {
	return ( dispatch ) => {
		const pluginId = plugin.id || plugin.slug;
		const defaultAction = {
			action: REMOVE_PLUGIN,
			siteId,
			pluginId,
		};
		dispatch( { ...defaultAction, type: PLUGIN_REMOVE_REQUEST } );

		const recordRemovePluginEvent = ( type, error ) => {
			dispatch( recordEvent( 'calypso_plugin_removed', plugin, siteId, error ) );
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

export function receiveAllSitesPlugins( allSitesPlugins ) {
	return {
		type: PLUGINS_ALL_RECEIVE,
		allSitesPlugins,
	};
}

export function fetchSitePlugins( siteId ) {
	return ( dispatch ) => {
		const defaultAction = {
			siteId,
		};
		dispatch( { ...defaultAction, type: PLUGINS_REQUEST } );

		const receivePluginsDispatchSuccess = ( data ) => {
			dispatch( receiveSitePlugins( siteId, data.plugins ) );
			dispatch( { ...defaultAction, type: PLUGINS_REQUEST_SUCCESS } );
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

export function fetchAllPlugins() {
	return ( dispatch ) => {
		dispatch( { type: PLUGINS_ALL_REQUEST } );

		const receivePluginsDispatchSuccess = ( { sites } ) => {
			dispatch( { type: PLUGINS_ALL_REQUEST_SUCCESS } );

			dispatch( receiveAllSitesPlugins( sites ) );
		};

		const receivePluginsDispatchFail = ( error ) => {
			dispatch( { type: PLUGINS_ALL_REQUEST_FAILURE, error } );
			dispatch( errorNotice( translate( 'Failed to retrieve plugins. Please try again later.' ) ) );
		};

		return wpcom.req
			.get( `/me/sites/plugins` )
			.then( receivePluginsDispatchSuccess )
			.catch( receivePluginsDispatchFail );
	};
}
