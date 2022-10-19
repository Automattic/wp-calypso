import { PLUGIN_NOTICES_REMOVE, RESET_PLUGIN_NOTICES } from 'calypso/state/action-types';

import 'calypso/state/plugins/init';

export function removePluginStatuses( ...statuses ) {
	return {
		type: PLUGIN_NOTICES_REMOVE,
		statuses,
	};
}

export function resetPluginStatuses() {
	return {
		type: RESET_PLUGIN_NOTICES,
	};
}
