/**
 * External dependencies
 */
import debugFactory from 'debug';
import defer from 'lodash/defer';

/**
 * Internal dependencies
 */
import analytics from 'lib/analytics';
import Dispatcher from 'dispatcher';
import utils from 'lib/site/utils';
import wpcom from 'lib/wp';

/**
 * Module vars
 */
const debug = debugFactory( 'calypso:my-sites:plugins:actions' );
let _actionsQueueBySite = {};

const queueSitePluginAction = ( action, siteId, pluginId, callback ) => {
	const next = ( nextCallback, error, data ) => {
		let nextAction;

		if ( nextCallback ) {
			nextCallback( error, data );
		}

		nextAction = _actionsQueueBySite[ siteId ].shift();

		if ( nextAction ) {
			nextAction.action( next.bind( this, nextAction.callback ) );
		} else {
			delete _actionsQueueBySite[ siteId ];
		}
	};

	if ( _actionsQueueBySite[ siteId ] ) {
		_actionsQueueBySite[ siteId ].push( {
			action: action,
			siteId: siteId,
			pluginId: pluginId,
			callback: callback
		} );
	} else {
		_actionsQueueBySite[ siteId ] = [];
		action( next.bind( this, callback ) );
	}
};

const queueSitePluginActionAsPromise = ( action, siteId, pluginId, callback ) => {
	return new Promise( ( resolve, reject ) => {
		queueSitePluginAction( action, siteId, pluginId, ( error, data ) => {
			if ( callback ) {
				callback( error, data );
			}
			if ( error ) {
				reject( error );
			}
			resolve( data );
		} );
	} );
};

const getSolvedPromise = ( dataToPass ) => {
	return new Promise( resolve => resolve( dataToPass ) );
};

const getRejectedPromise = ( errorToPass ) => {
	return new Promise( ( resolve, reject ) => reject( errorToPass ) );
};

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

/**
 * Return the bound plugin method
 *
 * @param {Object} site - site object
 * @param {String} pluginId - plugin identifier
 * @param {String} method - plugin method to bind
 * @return {Function} bound function
 */
const getPluginBoundMethod = ( site, pluginId, method ) => {
	const handler = getPluginHandler( site, pluginId );
	return handler[ method ].bind( handler );
};

const recordEvent = ( eventType, plugin, site, error ) => {
	if ( error ) {
		analytics.tracks.recordEvent( eventType + '_error', {
			site: site.ID,
			plugin: plugin.slug,
			error: error.error
		} );
		analytics.mc.bumpStat( eventType, 'failed' );
		return;
	}
	analytics.tracks.recordEvent( eventType + '_success', {
		site: site.ID,
		plugin: plugin.slug
	} );
	analytics.mc.bumpStat( eventType, 'succeeded' );
};

// Updates a plugin without launching the events that notifies
// the user that an update is going on.
// Used for updating plugins automatically on the background.
const autoupdatePlugin = ( site, plugin ) => {
	Dispatcher.handleViewAction( {
		type: 'AUTOUPDATE_PLUGIN',
		action: 'AUTOUPDATE_PLUGIN',
		site: site,
		plugin: plugin
	} );

	analytics.tracks.recordEvent( 'calypso_plugin_update_automatic', {
		site: site.ID,
		plugin: plugin.slug
	} );

	analytics.mc.bumpStat( 'calypso_plugin_update_automatic' );

	const boundEnableAU = getPluginBoundMethod( site, plugin.id, 'updateVersion' );
	queueSitePluginAction( boundEnableAU, site.ID, plugin.id, ( error, data ) => {
		Dispatcher.handleServerAction( {
			type: 'RECEIVE_AUTOUPDATE_PLUGIN',
			action: 'AUTOUPDATE_PLUGIN',
			site: site,
			plugin: plugin,
			data: data,
			error: error
		} );
		recordEvent( 'calypso_plugin_updated_automatic', plugin, site, error );
	} );
};

const processAutoupdates = ( site, plugins ) => {
	if ( site.canAutoupdateFiles &&
		site.jetpack &&
		site.canManage() &&
		utils.userCan( 'manage_options', site )
	) {
		plugins.forEach( plugin => {
			if ( plugin.update && plugin.autoupdate ) {
				autoupdatePlugin( site, plugin );
			}
		} );
	}
};

const PluginsActions = {
	removePluginsNotices: logs => {
		Dispatcher.handleViewAction( {
			type: 'REMOVE_PLUGINS_NOTICES',
			logs: logs
		} );
	},

	fetchSitePlugins: site => {
		if ( ! utils.userCan( 'manage_options', site ) || ! site.jetpack ) {
			defer( () => {
				Dispatcher.handleViewAction( {
					type: 'NOT_ALLOWED_TO_RECEIVE_PLUGINS',
					action: 'RECEIVE_PLUGINS',
					site: site
				} );
			} );

			return;
		}

		const receivePluginsDispatcher = ( error, data ) => {
			Dispatcher.handleServerAction( {
				type: 'RECEIVE_PLUGINS',
				action: 'RECEIVE_PLUGINS',
				site: site,
				data: data,
				error: error
			} );
			if ( ! error ) {
				processAutoupdates( site, data.plugins );
			}
		};

		if ( site.jetpack ) {
			wpcom.site( site.ID ).pluginsList( receivePluginsDispatcher );
		} else {
			wpcom.site( site.ID ).wpcomPluginsList( receivePluginsDispatcher );
		}
	},

	updatePlugin: ( site, plugin ) => {
		debug( 'updatePlugin', site, plugin );

		// There doesn't seem to be anything to update
		if ( ! plugin.update ) {
			return;
		}

		// Site isn't able to update Files.
		if ( ! site.canUpdateFiles ) {
			return;
		}

		Dispatcher.handleViewAction( {
			type: 'UPDATE_PLUGIN',
			action: 'UPDATE_PLUGIN',
			site: site,
			plugin: plugin
		} );

		const boundUpdate = getPluginBoundMethod( site, plugin.id, 'updateVersion' );
		queueSitePluginAction( boundUpdate, site.ID, plugin.id, ( error, data ) => {
			Dispatcher.handleServerAction( {
				type: 'RECEIVE_UPDATED_PLUGIN',
				action: 'UPDATE_PLUGIN',
				site: site,
				plugin: plugin,
				data: data,
				error: error
			} );
			recordEvent( 'calypso_plugin_updated', plugin, site, error );
		} );
	},

	installPlugin: ( site, plugin ) => {
		if ( ! site.canUpdateFiles ) {
			return getRejectedPromise( 'Error: Can\'t update files on the site' );
		}

		if ( ! utils.userCan( 'manage_options', site ) ) {
			return getRejectedPromise( 'Error: User can\'t manage the site' );
		}

		const install = () => {
			const bound = getPluginBoundMethod( site, plugin.slug, 'install' );
			return queueSitePluginActionAsPromise( bound, site.ID, plugin.slug );
		};

		const update = pluginData => {
			const { id } = pluginData;
			const bound = getPluginBoundMethod( site, id, 'updateVersion' );
			return queueSitePluginActionAsPromise( bound, site.ID, id );
		};

		const activate = pluginData => {
			const { id } = pluginData;
			const bound = getPluginBoundMethod( site, id, 'activate' );
			return queueSitePluginActionAsPromise( bound, site.ID, id );
		};

		const autoupdate = pluginData => {
			const { id } = pluginData;
			const bound = getPluginBoundMethod( site, id, 'enableAutoupdate' );
			return queueSitePluginActionAsPromise( bound, site.ID, pluginData.id );
		};

		const dispatchMessage = ( type, responseData, error ) => {
			const message = {
				type: type,
				action: 'INSTALL_PLUGIN',
				site: site,
				plugin: plugin,
				data: responseData,
				error: error
			};
			if ( 'INSTALL_PLUGIN' === type ) {
				Dispatcher.handleViewAction( message );
				return;
			}

			Dispatcher.handleServerAction( message );
			recordEvent( 'calypso_plugin_installed', plugin, site, error );
		};

		const manageSuccess = responseData => {
			dispatchMessage( 'RECEIVE_INSTALLED_PLUGIN', responseData );
			return responseData;
		};

		const manageError = error => {
			if ( error.name === 'PluginAlreadyInstalledError' ) {
				if ( site.isMainNetworkSite() ) {
					return update( plugin )
						.then( autoupdate )
						.then( manageSuccess )
						.catch( manageError );
				}

				return update( plugin )
					.then( activate )
					.then( autoupdate )
					.then( manageSuccess )
					.catch( manageError );
			}
			if ( error.name === 'ActivationErrorError' ) {
				return update( plugin )
					.then( autoupdate )
					.then( manageSuccess )
					.catch( manageError );
			}

			dispatchMessage( 'RECEIVE_INSTALLED_PLUGIN', null, error );
			return error;
		};

		dispatchMessage( 'INSTALL_PLUGIN' );

		if ( site.isMainNetworkSite() ) {
			return install()
				.then( autoupdate )
				.then( manageSuccess )
				.catch( manageError );
		}

		return install()
			.then( activate )
			.then( autoupdate )
			.then( manageSuccess )
			.catch( manageError );
	},

	removePlugin: ( site, plugin ) => {
		if ( ! site.canUpdateFiles || ! utils.userCan( 'manage_options', site ) ) {
			return;
		}

		Dispatcher.handleViewAction( {
			type: 'REMOVE_PLUGIN',
			action: 'REMOVE_PLUGIN',
			site: site,
			plugin: plugin
		} );

		const dispatchMessage = ( type, responseData, error ) => {
			const message = {
				type: type,
				action: 'REMOVE_PLUGIN',
				site: site,
				plugin: plugin,
				data: responseData,
				error: error
			};

			Dispatcher.handleServerAction( message );
			recordEvent( 'calypso_plugin_removed', plugin, site, error );
		};

		const remove = pluginData => {
			const { id } = pluginData;
			const bound = getPluginBoundMethod( site, id, 'delete' );
			return queueSitePluginActionAsPromise( bound, site.ID, id );
		};

		const deactivate = pluginData => {
			if ( pluginData.active ) {
				const { id } = pluginData;
				const bound = getPluginBoundMethod( site, id, 'deactivate' );
				return queueSitePluginActionAsPromise( bound, site.ID, id );
			}
			return getSolvedPromise( pluginData );
		};

		const disableAutoupdate = pluginData => {
			if ( pluginData.autoupdate ) {
				const { id } = pluginData;
				const bound = getPluginBoundMethod( site, id, 'disableAutoupdate' );
				return queueSitePluginActionAsPromise( bound, site.ID, id );
			}
			return getSolvedPromise( pluginData );
		};

		return deactivate( plugin )
			.then( disableAutoupdate )
			.then( remove )
			.then( responseData => dispatchMessage( 'RECEIVE_REMOVE_PLUGIN', responseData ) )
			.catch( error => dispatchMessage( 'RECEIVE_REMOVE_PLUGIN', null, error ) );
	},

	activatePlugin: ( site, plugin ) => {
		Dispatcher.handleViewAction( {
			type: 'ACTIVATE_PLUGIN',
			action: 'ACTIVATE_PLUGIN',
			site: site,
			plugin: plugin
		} );

		const pluginId = getPluginId( site, plugin );
		const pluginHandler = getPluginHandler( site, pluginId );
		const activate = pluginHandler.activate.bind( pluginHandler );

		queueSitePluginAction( activate, site.ID, pluginId, ( error, data ) => {
			Dispatcher.handleServerAction( {
				type: 'RECEIVE_ACTIVATED_PLUGIN',
				action: 'ACTIVATE_PLUGIN',
				site: site,
				plugin: plugin,
				data: data,
				error: error
			} );

			// Sometime data can be empty or the plugin always
			// return the active state even when the error is empty.
			// Activation error is ok, because it means the plugin is already active
			if (
				( error && error.error !== 'activation_error' ) ||
				( ! ( data && data.active ) &&
				! error )
			) {
				analytics.mc.bumpStat( 'calypso_plugin_activated', 'failed' );
				analytics.tracks.recordEvent( 'calypso_plugin_activated_error', {
					error: error && error.error ? error.error : 'Undefined activation error',
					site: site.ID,
					plugin: plugin.slug
				} );

				return;
			}

			analytics.mc.bumpStat( 'calypso_plugin_activated', 'succeeded' );
			analytics.tracks.recordEvent( 'calypso_plugin_activated_success', {
				site: site.ID,
				plugin: plugin.slug
			} );
		} );
	},

	deactivatePlugin: ( site, plugin ) => {
		Dispatcher.handleViewAction( {
			type: 'DEACTIVATE_PLUGIN',
			action: 'DEACTIVATE_PLUGIN',
			site: site,
			plugin: plugin
		} );

		const pluginId = getPluginId( site, plugin );
		const pluginHandler = getPluginHandler( site, pluginId );
		const deactivate = pluginHandler.deactivate.bind( pluginHandler );

		// make the API Request
		queueSitePluginAction( deactivate, site.ID, pluginId, ( error, data ) => {
			Dispatcher.handleServerAction( {
				type: 'RECEIVE_DEACTIVATED_PLUGIN',
				action: 'DEACTIVATE_PLUGIN',
				site: site,
				plugin: plugin,
				data: data,
				error: error
			} );

			// Sometime data can be empty or the plugin always
			// return the active state even when the error is empty.
			// Activation error is ok, because it means the plugin is already active
			if ( error && error.error !== 'deactivation_error' ) {
				analytics.mc.bumpStat( 'calypso_plugin_deactivated', 'failed' );
				analytics.tracks.recordEvent( 'calypso_plugin_deactivated_error', {
					error: error.error ? error.error : 'Undefined deactivation error',
					site: site.ID,
					plugin: plugin.slug
				} );

				return;
			}
			analytics.mc.bumpStat( 'calypso_plugin_deactivated', 'succeeded' );
			analytics.tracks.recordEvent( 'calypso_plugin_deactivated_success', {
				site: site.ID,
				plugin: plugin.slug
			} );
		} );
	},

	togglePluginActivation: ( site, plugin ) => {
		if ( ! utils.userCan( 'manage_options', site ) ) {
			return;
		}

		debug( 'togglePluginActivation', site, plugin );
		if ( ! plugin.active ) {
			PluginsActions.activatePlugin( site, plugin );
		} else {
			PluginsActions.deactivatePlugin( site, plugin );
		}
	},

	enableAutoUpdatesPlugin: ( site, plugin ) => {
		if ( ! utils.userCan( 'manage_options', site ) || ! site.canAutoupdateFiles ) {
			return;
		}
		Dispatcher.handleViewAction( {
			type: 'ENABLE_AUTOUPDATE_PLUGIN',
			action: 'ENABLE_AUTOUPDATE_PLUGIN',
			site: site,
			plugin: plugin
		} );

		const boundEnableAU = getPluginBoundMethod( site, plugin.id, 'enableAutoupdate' );
		queueSitePluginAction( boundEnableAU, site.ID, plugin.id, ( error, data ) => {
			Dispatcher.handleServerAction( {
				type: 'RECEIVE_ENABLED_AUTOUPDATE_PLUGIN',
				action: 'ENABLE_AUTOUPDATE_PLUGIN',
				site: site,
				plugin: plugin,
				data: data,
				error: error
			} );
			recordEvent( 'calypso_plugin_autoupdate_enabled', plugin, site, error );

			if ( plugin.update && ! error ) {
				PluginsActions.updatePlugin( site, plugin );
			}
		} );
	},

	disableAutoUpdatesPlugin: ( site, plugin ) => {
		if ( ! utils.userCan( 'manage_options', site ) || ! site.canAutoupdateFiles ) {
			return;
		}

		Dispatcher.handleViewAction( {
			type: 'DISABLE_AUTOUPDATE_PLUGIN',
			action: 'DISABLE_AUTOUPDATE_PLUGIN',
			site: site,
			plugin: plugin
		} );

		// make the API Request
		const disableAA = getPluginBoundMethod( site, plugin.id, 'disableAutoupdate' );
		queueSitePluginAction( disableAA, site.ID, plugin.id, ( error, data ) => {
			Dispatcher.handleServerAction( {
				type: 'RECEIVE_DISABLED_AUTOUPDATE_PLUGIN',
				action: 'DISABLE_AUTOUPDATE_PLUGIN',
				site: site,
				plugin: plugin,
				data: data,
				error: error
			} );
			recordEvent( 'calypso_plugin_autoupdate_disabled', plugin, site, error );
		} );
	},

	togglePluginAutoUpdate: ( site, plugin ) => {
		if ( ! utils.userCan( 'manage_options', site ) || ! site.canAutoupdateFiles ) {
			return;
		}

		if ( ! plugin.autoupdate ) {
			PluginsActions.enableAutoUpdatesPlugin( site, plugin );
		} else {
			PluginsActions.disableAutoUpdatesPlugin( site, plugin );
		}
	},

	removePluginUpdateInfo: ( site, plugin ) => {
		Dispatcher.handleViewAction( {
			type: 'REMOVE_PLUGINS_UPDATE_INFO',
			site: site,
			plugin: plugin
		} );
	},

	resetQueue: () => {
		_actionsQueueBySite = {};
	}
};
module.exports = PluginsActions;
