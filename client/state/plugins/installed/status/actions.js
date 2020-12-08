/**
 * Internal dependencies
 */
import Dispatcher from 'calypso/dispatcher';
import { PLUGIN_NOTICES_REMOVE } from 'calypso/state/action-types';

export function removePluginStatuses( ...statuses ) {
	return ( dispatch ) => {
		dispatch( {
			type: PLUGIN_NOTICES_REMOVE,
			statuses,
		} );

		// @TODO: Remove when this flux action is completely reduxified
		Dispatcher.handleViewAction( {
			type: 'REMOVE_PLUGINS_NOTICES',
			logs: statuses,
		} );
	};
}
