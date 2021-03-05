/**
 * Internal dependencies
 */
import { PLUGIN_NOTICES_REMOVE } from 'calypso/state/action-types';

import 'calypso/state/plugins/init';

export function removePluginStatuses( ...statuses ) {
	return {
		type: PLUGIN_NOTICES_REMOVE,
		statuses,
	};
}
