/**
 * Internal dependencies
 */
import type { AppState } from 'calypso/types';

/**
 * Returns whether or not retention period information is being requested for a given site ID.
 *
 * @param state The application state.
 * @param siteId The site for which to retrieve request status.
 * @returns True if retention period information is being requested; otherwise, false.
 */
const isRequestingSiteActivityLogRetentionPolicy = (
	state: AppState,
	siteId: number | null
): boolean => {
	if ( ! Number.isInteger( siteId ) ) {
		return false;
	}

	return state.activityLog.retentionPolicy[ siteId as number ]?.requestStatus === 'pending';
};

export default isRequestingSiteActivityLogRetentionPolicy;
