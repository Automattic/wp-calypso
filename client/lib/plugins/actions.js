/**
 * External dependencies
 */
import { defer } from 'lodash';

/**
 * Internal dependencies
 */
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { bumpStat } from 'calypso/lib/analytics/mc';
import Dispatcher from 'calypso/dispatcher';
import { userCan } from 'calypso/lib/site/utils';
import wpcom from 'calypso/lib/wp';

/**
 * Module vars
 */
let _actionsQueueBySite = {};

const queueSitePluginAction = ( action, siteId, pluginId, callback ) => {
	const next = ( nextCallback, error, data ) => {
		if ( nextCallback ) {
			nextCallback( error, data );
		}

		const nextAction = _actionsQueueBySite[ siteId ].shift();

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
			callback: callback,
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
	return new Promise( ( resolve ) => resolve( dataToPass ) );
};

/**
 * Return a SitePlugin instance used to handle the plugin
 *
 * @param {object} site - site object
 * @param {string} pluginId - plugin identifier
 * @returns {object} SitePlugin instance
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
 * @param {object} site - site object
 * @param {string} pluginId - plugin identifier
 * @param {string} method - plugin method to bind
 * @returns {Function} bound function
 */
const getPluginBoundMethod = ( site, pluginId, method ) => {
	const handler = getPluginHandler( site, pluginId );
	return handler[ method ].bind( handler );
};

const recordEvent = ( eventType, plugin, site, error ) => {
	if ( error ) {
		recordTracksEvent( eventType + '_error', {
			site: site.ID,
			plugin: plugin.slug,
			error: error.error,
		} );
		bumpStat( eventType, 'failed' );
		return;
	}
	recordTracksEvent( eventType + '_success', {
		site: site.ID,
		plugin: plugin.slug,
	} );
	bumpStat( eventType, 'succeeded' );
};

const PluginsActions = {
	removePluginsNotices: ( ...logs ) => {
		Dispatcher.handleViewAction( {
			type: 'REMOVE_PLUGINS_NOTICES',
			logs: logs,
		} );
	},

	fetchSitePlugins: ( site ) => {
		if ( ! userCan( 'manage_options', site ) || ! site.jetpack ) {
			defer( () => {
				Dispatcher.handleViewAction( {
					type: 'NOT_ALLOWED_TO_RECEIVE_PLUGINS',
					action: 'RECEIVE_PLUGINS',
					site: site,
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
				error: error,
			} );
		};

		if ( site.jetpack ) {
			wpcom.site( site.ID ).pluginsList( receivePluginsDispatcher );
		} else {
			wpcom.site( site.ID ).wpcomPluginsList( receivePluginsDispatcher );
		}
	},

	removePlugin: ( site, plugin ) => {
		if ( ! site.canUpdateFiles || ! userCan( 'manage_options', site ) ) {
			return;
		}

		Dispatcher.handleViewAction( {
			type: 'REMOVE_PLUGIN',
			action: 'REMOVE_PLUGIN',
			site: site,
			plugin: plugin,
		} );

		const dispatchMessage = ( type, responseData, error ) => {
			const message = {
				type: type,
				action: 'REMOVE_PLUGIN',
				site: site,
				plugin: plugin,
				data: responseData,
				error: error,
			};

			Dispatcher.handleServerAction( message );
			recordEvent( 'calypso_plugin_removed', plugin, site, error );
		};

		const remove = ( pluginData ) => {
			const { id } = pluginData;
			const bound = getPluginBoundMethod( site, id, 'delete' );
			return queueSitePluginActionAsPromise( bound, site.ID, id );
		};

		const deactivate = ( pluginData ) => {
			if ( pluginData.active ) {
				const { id } = pluginData;
				const bound = getPluginBoundMethod( site, id, 'deactivate' );
				return queueSitePluginActionAsPromise( bound, site.ID, id );
			}
			return getSolvedPromise( pluginData );
		};

		const disableAutoupdate = ( pluginData ) => {
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
			.then( ( responseData ) => dispatchMessage( 'RECEIVE_REMOVE_PLUGIN', responseData ) )
			.catch( ( error ) => dispatchMessage( 'RECEIVE_REMOVE_PLUGIN', null, error ) );
	},

	removePluginUpdateInfo: ( site, plugin ) => {
		Dispatcher.handleViewAction( {
			type: 'REMOVE_PLUGINS_UPDATE_INFO',
			site: site,
			plugin: plugin,
		} );
	},

	resetQueue: () => {
		_actionsQueueBySite = {};
	},
};
export default PluginsActions;
