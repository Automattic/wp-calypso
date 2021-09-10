import type { AppState } from 'calypso/types';

/**
 * Returns whether or not Rewind policies are currently being
 * requested for a given site ID.
 *
 * @param state The application state.
 * @param siteId The site for which to retrieve request status.
 * @returns True if policies are being requested; otherwise, false.
 */
const isRequestingRewindPolicies = ( state: AppState, siteId: number | null ): boolean => {
	if ( ! Number.isInteger( siteId ) ) {
		return false;
	}

	return state.rewind?.[ siteId as number ]?.policies?.requestStatus === 'pending';
};

export default isRequestingRewindPolicies;
