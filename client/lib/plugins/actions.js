/**
 * External dependencies
 */
import { defer } from 'lodash';

/**
 * Internal dependencies
 */
import Dispatcher from 'calypso/dispatcher';
import { userCan } from 'calypso/lib/site/utils';
import wpcom from 'calypso/lib/wp';

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

	removePluginUpdateInfo: ( site, plugin ) => {
		Dispatcher.handleViewAction( {
			type: 'REMOVE_PLUGINS_UPDATE_INFO',
			site: site,
			plugin: plugin,
		} );
	},
};

export default PluginsActions;
