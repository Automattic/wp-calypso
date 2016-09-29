/**
 * External dependencies
 */
import wpcom from 'lib/wp';

/**
 * Internal dependencies
 */
import utils from 'lib/site/utils';
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
	PLUGIN_REMOVE_REQUEST_FAILURE
} from 'state/action-types';
import {
	ACTIVATE_PLUGIN,
	DEACTIVATE_PLUGIN,
	UPDATE_PLUGIN,
	ENABLE_AUTOUPDATE_PLUGIN,
	DISABLE_AUTOUPDATE_PLUGIN,
	INSTALL_PLUGIN,
	REMOVE_PLUGIN
} from './constants';

/**
 * Return plugin id depending if the site is a jetpack site
 *
 * @param {Object} site - site object
 * @param {Object} plugin - plugin object
 * @return {String} plugin if
 */
const getPluginId = ( site, plugin ) => {
	return site.jetpack ? plugin.id : plugin.slug;
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
	const pluginHandler = site.jetpack
		? siteHandler.plugin( pluginId )
		: siteHandler.wpcomPlugin( pluginId );

	return pluginHandler;
};

export function activatePlugin( site, plugin ) {
	return ( dispatch ) => {
		const pluginId = getPluginId( site, plugin );
		const defaultAction = {
			action: ACTIVATE_PLUGIN,
			siteId: site.ID,
			pluginId,
		};
		dispatch( Object.assign( {}, defaultAction, { type: PLUGIN_ACTIVATE_REQUEST } ) );

		const successCallback = ( data ) => {
			dispatch( Object.assign( {}, defaultAction, { type: PLUGIN_ACTIVATE_REQUEST_SUCCESS, data } ) );
		};

		const errorCallback = ( error ) => {
			// This error means it's already active.
			if ( error && error.error === 'activation_error' ) {
				successCallback( plugin );
			}
			dispatch( Object.assign( {}, defaultAction, { type: PLUGIN_ACTIVATE_REQUEST_FAILURE, error } ) );
		};

		return getPluginHandler( site, pluginId ).activate().then( successCallback ).catch( errorCallback );
	};
}

export function deactivatePlugin( site, plugin ) {
	return ( dispatch ) => {
		const pluginId = getPluginId( site, plugin );
		const defaultAction = {
			action: DEACTIVATE_PLUGIN,
			siteId: site.ID,
			pluginId,
		};
		dispatch( Object.assign( {}, defaultAction, { type: PLUGIN_DEACTIVATE_REQUEST } ) );

		const successCallback = ( data ) => {
			dispatch( Object.assign( {}, defaultAction, { type: PLUGIN_DEACTIVATE_REQUEST_SUCCESS, data } ) );
		};

		const errorCallback = ( error ) => {
			// This error means it's already inactive.
			if ( error && error.error === 'deactivation_error' ) {
				successCallback( plugin );
			}
			dispatch( Object.assign( {}, defaultAction, { type: PLUGIN_DEACTIVATE_REQUEST_FAILURE, error } ) );
		};

		return getPluginHandler( site, pluginId ).deactivate().then( successCallback ).catch( errorCallback );
	};
}

export function updatePlugin( site, plugin ) {
	return ( dispatch ) => {
		if ( ! plugin.update ) {
			return Promise.reject( 'Error: Plugin already up-to-date.' );
		}

		const pluginId = getPluginId( site, plugin );
		const defaultAction = {
			action: UPDATE_PLUGIN,
			siteId: site.ID,
			pluginId,
		};
		dispatch( Object.assign( {}, defaultAction, { type: PLUGIN_UPDATE_REQUEST } ) );

		const successCallback = ( data ) => {
			dispatch( Object.assign( {}, defaultAction, { type: PLUGIN_UPDATE_REQUEST_SUCCESS, data } ) );
		};

		const errorCallback = ( error ) => {
			dispatch( Object.assign( {}, defaultAction, { type: PLUGIN_UPDATE_REQUEST_FAILURE, error } ) );
		};

		if ( ! site.canUpdateFiles ) {
			const cantUpdateError = new Error( 'Error: Can\'t update files on the site' );
			errorCallback( cantUpdateError );
			return Promise.reject( cantUpdateError );
		}

		return getPluginHandler( site, pluginId ).updateVersion().then( successCallback ).catch( errorCallback );
	};
}

export function enableAutoupdatePlugin( site, plugin ) {
	return ( dispatch ) => {
		if ( ! utils.userCan( 'manage_options', site ) || ! site.canAutoupdateFiles ) {
			return Promise.reject( 'Error: We can\'t update files on this site.' );
		}

		const pluginId = getPluginId( site, plugin );
		const defaultAction = {
			action: ENABLE_AUTOUPDATE_PLUGIN,
			siteId: site.ID,
			pluginId,
		};
		dispatch( Object.assign( {}, defaultAction, { type: PLUGIN_AUTOUPDATE_ENABLE_REQUEST } ) );

		const successCallback = ( data ) => {
			dispatch( Object.assign( {}, defaultAction, { type: PLUGIN_AUTOUPDATE_ENABLE_REQUEST_SUCCESS, data } ) );
			this.update( site, plugin );
		};

		const errorCallback = ( error ) => {
			dispatch( Object.assign( {}, defaultAction, { type: PLUGIN_AUTOUPDATE_ENABLE_REQUEST_FAILURE, error } ) );
		};

		return getPluginHandler( site, pluginId ).enableAutoupdate().then( successCallback ).catch( errorCallback );
	};
}

export function disableAutoupdatePlugin( site, plugin ) {
	return ( dispatch ) => {
		if ( ! utils.userCan( 'manage_options', site ) || ! site.canAutoupdateFiles ) {
			return;
		}

		const pluginId = getPluginId( site, plugin );
		const defaultAction = {
			action: DISABLE_AUTOUPDATE_PLUGIN,
			siteId: site.ID,
			pluginId,
		};
		dispatch( Object.assign( {}, defaultAction, { type: PLUGIN_AUTOUPDATE_DISABLE_REQUEST } ) );

		const successCallback = ( data ) => {
			dispatch( Object.assign( {}, defaultAction, { type: PLUGIN_AUTOUPDATE_DISABLE_REQUEST_SUCCESS, data } ) );
		};

		const errorCallback = ( error ) => {
			dispatch( Object.assign( {}, defaultAction, { type: PLUGIN_AUTOUPDATE_DISABLE_REQUEST_FAILURE, error } ) );
		};

		return getPluginHandler( site, pluginId ).disableAutoupdate().then( successCallback ).catch( errorCallback );
	};
}

export function installPlugin( site, plugin ) {
	return ( dispatch ) => {
		const pluginId = getPluginId( site, plugin );
		const defaultAction = {
			action: INSTALL_PLUGIN,
			siteId: site.ID,
			pluginId,
		};
		dispatch( Object.assign( {}, defaultAction, { type: PLUGIN_INSTALL_REQUEST } ) );

		const doInstall = function( pluginData ) {
			return getPluginHandler( site, pluginData.id ).install();
		};

		const doActivate = function( pluginData ) {
			return getPluginHandler( site, pluginData.id ).activate();
		};

		const doUpdate = function( pluginData ) {
			return getPluginHandler( site, pluginData.id ).updateVersion();
		};

		const doAutoupdates = function( pluginData ) {
			return getPluginHandler( site, pluginData.id ).enableAutoupdate();
		};

		const successCallback = ( data ) => {
			dispatch( Object.assign( {}, defaultAction, { type: PLUGIN_INSTALL_REQUEST_SUCCESS, data } ) );
		};

		const errorCallback = ( error ) => {
			if ( error.name === 'PluginAlreadyInstalledError' ) {
				if ( site.isMainNetworkSite() ) {
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
			dispatch( Object.assign( {}, defaultAction, { type: PLUGIN_INSTALL_REQUEST_FAILURE, error } ) );
			return Promise.reject( error );
		};

		if ( ! site.canUpdateFiles || ! utils.userCan( 'manage_options', site ) ) {
			const cantUpdateError = new Error( 'Error: Can\'t update files on the site' );
			return errorCallback( cantUpdateError );
		}

		if ( site.isMainNetworkSite() ) {
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

export function removePlugin( site, plugin ) {
	return ( dispatch ) => {
		const pluginId = getPluginId( site, plugin );
		const defaultAction = {
			action: REMOVE_PLUGIN,
			siteId: site.ID,
			pluginId,
		};
		dispatch( Object.assign( {}, defaultAction, { type: PLUGIN_REMOVE_REQUEST } ) );

		const doDeactivate = function( pluginData ) {
			if ( pluginData.active ) {
				return getPluginHandler( site, pluginData.id ).deactivate();
			}
			return Promise.resolve( pluginData );
		};

		const doDisableAutoupdate = function( pluginData ) {
			if ( pluginData.autoupdate ) {
				return getPluginHandler( site, pluginData.id ).disableAutoupdate();
			}
			return Promise.resolve( pluginData );
		};

		const doRemove = function( pluginData ) {
			return getPluginHandler( site, pluginData.id ).delete();
		};

		const successCallback = () => {
			dispatch( Object.assign( {}, defaultAction, { type: PLUGIN_REMOVE_REQUEST_SUCCESS } ) );
		};

		const errorCallback = ( error ) => {
			dispatch( Object.assign( {}, defaultAction, { type: PLUGIN_REMOVE_REQUEST_FAILURE, error } ) );
			return Promise.reject( error );
		};

		if ( ! site.canUpdateFiles || ! utils.userCan( 'manage_options', site ) ) {
			const cantUpdateError = new Error( 'Error: Can\'t update files on the site' );
			return errorCallback( cantUpdateError );
		}

		return doDeactivate( plugin )
			.then( doDisableAutoupdate )
			.then( doRemove )
			.then( successCallback )
			.catch( errorCallback );
	};
}

export function fetchPlugins( sites ) {
	return ( dispatch ) => {
		return sites.map( ( site ) => {
			const defaultAction = {
				siteId: site.ID,
			};
			dispatch( Object.assign( {}, defaultAction, { type: PLUGINS_REQUEST } ) );

			const receivePluginsDispatchSuccess = ( data ) => {
				dispatch( Object.assign( {}, defaultAction, { type: PLUGINS_RECEIVE } ) );
				dispatch( Object.assign( {}, defaultAction, { type: PLUGINS_REQUEST_SUCCESS, data: data.plugins } ) );
			};

			const receivePluginsDispatchFail = ( error ) => {
				dispatch( Object.assign( {}, defaultAction, { type: PLUGINS_RECEIVE } ) );
				dispatch( Object.assign( {}, defaultAction, { type: PLUGINS_REQUEST_FAILURE, error } ) );
			};

			if ( site.jetpack ) {
				return wpcom.site( site.ID ).pluginsList().then( receivePluginsDispatchSuccess ).catch( receivePluginsDispatchFail );
			}

			return wpcom.site( site.ID ).wpcomPluginsList().then( receivePluginsDispatchSuccess ).catch( receivePluginsDispatchFail );
		} );
	};
}
