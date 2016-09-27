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

export default {
	activate: function( site, plugin ) {
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
	},

	deactivate: function( site, plugin ) {
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
	},

	update: function( site, plugin ) {
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
	},

	enableAutoupdate: function( site, plugin ) {
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
	},

	disableAutoupdate: function( site, plugin ) {
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
	},

	install: function( site, plugin ) {
		return ( dispatch ) => {
			const pluginId = getPluginId( site, plugin );
			const defaultAction = {
				action: INSTALL_PLUGIN,
				siteId: site.ID,
				pluginId,
			};
			dispatch( Object.assign( {}, defaultAction, { type: PLUGIN_INSTALL_REQUEST } ) );

			const install = function( pluginData ) {
				return getPluginHandler( site, pluginData.id ).install();
			};

			const activate = function( pluginData ) {
				return getPluginHandler( site, pluginData.id ).activate();
			};

			const update = function( pluginData ) {
				return getPluginHandler( site, pluginData.id ).updateVersion();
			};

			const autoupdates = function( pluginData ) {
				return getPluginHandler( site, pluginData.id ).enableAutoupdate();
			};

			const successCallback = ( data ) => {
				dispatch( Object.assign( {}, defaultAction, { type: PLUGIN_INSTALL_REQUEST_SUCCESS, data } ) );
			};

			const errorCallback = ( error ) => {
				if ( error.name === 'PluginAlreadyInstalledError' ) {
					if ( site.isMainNetworkSite() ) {
						return update( plugin )
							.then( autoupdates )
							.then( successCallback )
							.catch( errorCallback );
					}
					return update( plugin )
						.then( activate )
						.then( autoupdates )
						.then( successCallback )
						.catch( errorCallback );
				}
				if ( error.name === 'ActivationErrorError' ) {
					return update( plugin )
						.then( autoupdates )
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
				return install( plugin )
					.then( autoupdates )
					.then( successCallback )
					.catch( errorCallback );
			}

			return install( plugin )
				.then( activate )
				.then( autoupdates )
				.then( successCallback )
				.catch( errorCallback );
		};
	},

	remove: function( site, plugin ) {
		return ( dispatch ) => {
			const pluginId = getPluginId( site, plugin );
			const defaultAction = {
				action: REMOVE_PLUGIN,
				siteId: site.ID,
				pluginId,
			};
			dispatch( Object.assign( {}, defaultAction, { type: PLUGIN_REMOVE_REQUEST } ) );

			const deactivate = function( pluginData ) {
				if ( pluginData.active ) {
					return getPluginHandler( site, pluginData.id ).deactivate();
				}
				return Promise.resolve( pluginData );
			};

			const disableAutoupdate = function( pluginData ) {
				if ( pluginData.autoupdate ) {
					return getPluginHandler( site, pluginData.id ).disableAutoupdate();
				}
				return Promise.resolve( pluginData );
			};

			const remove = function( pluginData ) {
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

			return deactivate( plugin )
				.then( disableAutoupdate )
				.then( remove )
				.then( successCallback )
				.catch( errorCallback );
		};
	},

	fetch: function( sites ) {
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
};
