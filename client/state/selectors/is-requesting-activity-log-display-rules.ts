/**
 * Internal dependencies
 */
import type { AppState } from 'calypso/types';

/**
 * Returns whether or not Activity Log display rules are currently being
 * requested for a given site ID.
 *
 * @param state The application state.
 * @param siteId The site for which to retrieve request status.
 * @returns True if display rules are being requested; otherwise, false.
 */
const isRequestingActivityLogDisplayRules = ( state: AppState, siteId: number | null ): boolean => {
	if ( ! Number.isInteger( siteId ) ) {
		return false;
	}

	return state.activityLog.displayRules[ siteId as number ]?.requestStatus === 'pending';
};

export default isRequestingActivityLogDisplayRules;
