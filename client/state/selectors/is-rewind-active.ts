import getRewindState from 'calypso/state/selectors/get-rewind-state';
import type { AppState } from 'calypso/types';

/**
 * Indicates whether the Rewind feature is active
 *
 * @param {Object} state Global state tree
 * @param {number|string} siteId the site ID
 * @returns {boolean} true if rewind is active
 */
export default function isRewindActive( state: AppState, siteId: number ): boolean {
	return [ 'awaitingCredentials', 'provisioning', 'active' ].includes(
		getRewindState( state, siteId ).state
	);
}
