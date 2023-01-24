import { AppState } from 'calypso/types';
import type { RewindState } from 'calypso/state/data-layer/wpcom/sites/rewind/type';

import 'calypso/state/rewind/init';

const uninitialized = {
	state: 'uninitialized',
};

/**
 * Get the entire Rewind state object.
 *
 * @param {AppState} state Global state tree
 * @param {?number|string} siteId the site ID
 * @returns {Object} Rewind state object
 */
export default function getRewindState(
	state: AppState,
	siteId?: number | string | null
): RewindState {
	if ( ! siteId ) {
		return uninitialized;
	}

	return state.rewind?.[ siteId ]?.state ?? uninitialized;
}
