/**
 * Internal dependencies
 */
import Dispatcher from 'calypso/dispatcher';
import wpcom from 'calypso/lib/wp';

const PluginsActions = {
	removePluginsNotices: ( ...logs ) => {
		Dispatcher.handleViewAction( {
			type: 'REMOVE_PLUGINS_NOTICES',
			logs: logs,
		} );
	},

	fetchSitePlugins: ( site ) => {
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
};

export default PluginsActions;
