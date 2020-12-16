/**
 * Internal dependencies
 */
import { PLUGIN_NOTICES_REMOVE } from 'calypso/state/action-types';

export function removePluginStatuses( ...statuses ) {
	return {
		type: PLUGIN_NOTICES_REMOVE,
		statuses,
	};
}
