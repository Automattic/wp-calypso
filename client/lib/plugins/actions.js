/**
 * Internal dependencies
 */
import Dispatcher from 'calypso/dispatcher';

const PluginsActions = {
	removePluginsNotices: ( ...logs ) => {
		Dispatcher.handleViewAction( {
			type: 'REMOVE_PLUGINS_NOTICES',
			logs: logs,
		} );
	},
};

export default PluginsActions;
