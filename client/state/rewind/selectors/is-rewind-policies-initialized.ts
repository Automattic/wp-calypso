import type { AppState } from 'calypso/types';

/**
 * Returns whether or not Rewind policies are ever being
 * requested for a given site ID. Means if fe ever called the API.
 * @param state The application state.
 * @param siteId The site for which to retrieve request status.
 * @returns True if policies are being requested; otherwise, false.
 */
const isRewindPoliciesInitialized = ( state: AppState, siteId: number | null ): boolean => {
	return state.rewind?.[ siteId as number ]?.policies?.isInitialized || false;
};

export default isRewindPoliciesInitialized;
