/**
 * External dependencies
 */
var debug = require( 'debug' )( 'calypso:my-sites:plugins:actions' ),
	defer = require( 'lodash/function/defer' );
/**
 * Internal dependencies
 */
var analytics = require( 'analytics' ),
	Dispatcher = require( 'dispatcher' ),
	isBusiness = require( 'lib/products-values' ).isBusiness,
	wpcom = require( 'lib/wp' ).undocumented();

var _actionsQueueBySite = {},
	PluginsActions;

function queueSitePluginActionAsPromise( action, siteId, pluginId, callback ) {
	var promise = new Promise( function( resolve, reject ) {
		queueSitePluginAction( action, siteId, pluginId, function( error, data ) {
			if ( callback ) {
				callback( error, data );
			}
			if ( error ) {
				reject( error );
			}
			resolve( data );
		} );
	} );

	return promise;
}

function getSolvedPromise( dataToPass ) {
	return new Promise( resolve => resolve( dataToPass ) );
}

function getRejectedPromise( errorToPass ) {
	return new Promise( ( resolve, reject ) => reject( errorToPass ) );
}

function queueSitePluginAction( action, siteId, pluginId, callback ) {
	let next = function( nextCallback, error, data ) {
		let nextAction;

		if ( nextCallback ) {
			nextCallback( error, data );
		}

		nextAction = _actionsQueueBySite[ siteId ].shift();

		if ( nextAction ) {
			nextAction.action( nextAction.siteId, nextAction.pluginId, next.bind( this, nextAction.callback ) );
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
		action( siteId, pluginId, next.bind( this, callback ) );
	}
}

function recordEvent( eventType, plugin, site, error ) {
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
}

function processAutoupdates( site, plugins ) {
	if ( site.canAutoupdateFiles && site.jetpack && site.canManage() && site.user_can_manage ) {
		plugins.forEach( function( plugin ) {
			if ( plugin.update && plugin.autoupdate ) {
				autoupdatePlugin( site, plugin );
			}
		} );
	}
}

// Updates a plugin without launching the events that notifies the user that an update is going on.
// Used for updating plugins automatically on the background.
function autoupdatePlugin( site, plugin ) {
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

	queueSitePluginAction( wpcom.pluginsUpdate.bind( wpcom ), site.ID, plugin.id, function( error, data ) {
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
}

PluginsActions = {
	removePluginsNotices: function( logs ) {
		Dispatcher.handleViewAction( {
			type: 'REMOVE_PLUGINS_NOTICES',
			logs: logs
		} );
	},

	fetchSitePlugins: function( site ) {
		if ( ! site.user_can_manage || ( ! site.jetpack && ! isBusiness( site.plan ) ) ) {
			defer( () => {
				Dispatcher.handleViewAction( {
					type: 'NOT_ALLOWED_TO_RECEIVE_PLUGINS',
					action: 'RECEIVE_PLUGINS',
					site: site
				} );
			} );

			return;
		}
		const endpoint = site.jetpack ? wpcom.plugins : wpcom.wpcomPlugins;
		endpoint.call( wpcom, site.ID, ( error, data ) => {
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
		} );
	},

	updatePlugin: function( site, plugin ) {
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

		queueSitePluginAction( wpcom.pluginsUpdate.bind( wpcom ), site.ID, plugin.id, function( error, data ) {
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

	installPlugin: function( site, plugin ) {
		var install, activate, autoupdate, dispatchMessage;

		if ( ! site.canUpdateFiles ) {
			return getRejectedPromise( 'Error: Can\'t update files on the site' )
		}

		if ( ! site.user_can_manage ) {
			return getRejectedPromise( 'Error: User can\'t manage the site' )
		}

		install = function() {
			return queueSitePluginActionAsPromise( wpcom.pluginsInstall.bind( wpcom ), site.ID, plugin.slug );
		};

		activate = function( pluginData ) {
			return queueSitePluginActionAsPromise( wpcom.pluginsActivate.bind( wpcom ), site.ID, pluginData.id );
		};

		autoupdate = function( pluginData ) {
			return queueSitePluginActionAsPromise( wpcom.enableAutoupdates.bind( wpcom ), site.ID, pluginData.id );
		};

		dispatchMessage = function( type, responseData, error ) {
			var message = {
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

		dispatchMessage( 'INSTALL_PLUGIN' );

		if ( site.isMainNetworkSite() ) {
			return install()
				.then( autoupdate )
				.then( responseData => dispatchMessage( 'RECEIVE_INSTALLED_PLUGIN', responseData ) )
				.catch( error => dispatchMessage( 'RECEIVE_INSTALLED_PLUGIN', null, error ) );
		}
		return install()
			.then( activate )
			.then( autoupdate )
			.then( responseData => dispatchMessage( 'RECEIVE_INSTALLED_PLUGIN', responseData ) )
			.catch( error => dispatchMessage( 'RECEIVE_INSTALLED_PLUGIN', null, error ) );
	},

	removePlugin: function( site, plugin ) {
		var remove, deactivate, disableAutoupdate, dispatchMessage;

		if ( ! site.canUpdateFiles || ! site.user_can_manage ) {
			return;
		}
		Dispatcher.handleViewAction( {
			type: 'REMOVE_PLUGIN',
			action: 'REMOVE_PLUGIN',
			site: site,
			plugin: plugin
		} );

		dispatchMessage = function( type, responseData, error ) {
			var message = {
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

		remove = function( pluginData ) {
			return queueSitePluginActionAsPromise( wpcom.pluginsDelete.bind( wpcom ), site.ID, pluginData.id );
		};

		deactivate = function( pluginData ) {
			if ( pluginData.active ) {
				return queueSitePluginActionAsPromise( wpcom.pluginsDeactivate .bind( wpcom ), site.ID, pluginData.id );
			}
			return getSolvedPromise( pluginData );
		};

		disableAutoupdate = function( pluginData ) {
			if ( pluginData.autoupdate ) {
				return queueSitePluginActionAsPromise( wpcom.disableAutoupdates.bind( wpcom ), site.ID, pluginData.id );
			}
			return getSolvedPromise( pluginData );
		};

		return deactivate( plugin )
			.then( disableAutoupdate )
			.then( remove )
			.then( responseData => dispatchMessage( 'RECEIVE_REMOVE_PLUGIN', responseData ) )
			.catch( error => dispatchMessage( 'RECEIVE_REMOVE_PLUGIN', null, error ) );
	},

	activatePlugin: function( site, plugin ) {
		var endpoint = site.jetpack ? wpcom.pluginsActivate : wpcom.activateWpcomPlugin,
			pluginId = site.jetpack ? plugin.id : plugin.slug;

		Dispatcher.handleViewAction( {
			type: 'ACTIVATE_PLUGIN',
			action: 'ACTIVATE_PLUGIN',
			site: site,
			plugin: plugin
		} );

		queueSitePluginAction( endpoint.bind( wpcom ), site.ID, pluginId, function( error, data ) {
			Dispatcher.handleServerAction( {
				type: 'RECEIVE_ACTIVATED_PLUGIN',
				action: 'ACTIVATE_PLUGIN',
				site: site,
				plugin: plugin,
				data: data,
				error: error
			} );

			// Sometime data can be empty or the plugin always return the active state even when the error is empty.
			// Activation error is ok, because it means the plugin is already active
			if ( ( error && error.error !== 'activation_error' ) || ( ! ( data && data.active ) && ! error ) ) {
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

	deactivatePlugin: function( site, plugin ) {
		var endpoint = site.jetpack ? wpcom.pluginsDeactivate : wpcom.deactivateWpcomPlugin,
			pluginId = site.jetpack ? plugin.id : plugin.slug;

		Dispatcher.handleViewAction( {
			type: 'DEACTIVATE_PLUGIN',
			action: 'DEACTIVATE_PLUGIN',
			site: site,
			plugin: plugin
		} );

		// make the API Request
		queueSitePluginAction( endpoint.bind( wpcom ), site.ID, pluginId, function( error, data ) {
			Dispatcher.handleServerAction( {
				type: 'RECEIVE_DEACTIVATED_PLUGIN',
				action: 'DEACTIVATE_PLUGIN',
				site: site,
				plugin: plugin,
				data: data,
				error: error
			} );
			// Sometime data can be empty or the plugin always return the active state even when the error is empty.
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

	togglePluginActivation: function( site, plugin ) {
		if ( ! site.user_can_manage ) {
			return;
		}

		debug( 'togglePluginActivation', site, plugin );
		if ( ! plugin.active ) {
			PluginsActions.activatePlugin( site, plugin );
		} else {
			PluginsActions.deactivatePlugin( site, plugin );
		}
	},

	enableAutoUpdatesPlugin: function( site, plugin ) {
		if ( ! site.user_can_manage || ! site.canAutoupdateFiles ) {
			return;
		}
		Dispatcher.handleViewAction( {
			type: 'ENABLE_AUTOUPDATE_PLUGIN',
			action: 'ENABLE_AUTOUPDATE_PLUGIN',
			site: site,
			plugin: plugin
		} );

		queueSitePluginAction( wpcom.enableAutoupdates.bind( wpcom ), site.ID, plugin.id, function( error, data ) {
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

	disableAutoUpdatesPlugin: function( site, plugin ) {
		if ( ! site.user_can_manage || ! site.canAutoupdateFiles ) {
			return;
		}
		Dispatcher.handleViewAction( {
			type: 'DISABLE_AUTOUPDATE_PLUGIN',
			action: 'DISABLE_AUTOUPDATE_PLUGIN',
			site: site,
			plugin: plugin
		} );

		// make the API Request
		queueSitePluginAction( wpcom.disableAutoupdates.bind( wpcom ), site.ID, plugin.id, function( error, data ) {
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

	togglePluginAutoUpdate: function( site, plugin ) {
		if ( ! site.user_can_manage || ! site.canAutoupdateFiles ) {
			return;
		}
		if ( ! plugin.autoupdate ) {
			PluginsActions.enableAutoUpdatesPlugin( site, plugin );
		} else {
			PluginsActions.disableAutoUpdatesPlugin( site, plugin );
		}
	},

	removePluginUpdateInfo: function( site, plugin ) {
		Dispatcher.handleViewAction( {
			type: 'REMOVE_PLUGINS_UPDATE_INFO',
			site: site,
			plugin: plugin
		} );
	},

	resetQueue: function() {
		_actionsQueueBySite = {};
	}
};

module.exports = PluginsActions;
