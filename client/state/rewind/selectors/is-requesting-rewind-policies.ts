import getRewindPoliciesRequestStatus from './get-rewind-policies-request-status';
import type { AppState } from 'calypso/types';

/**
 * Returns whether or not Rewind policies are currently being
 * requested for a given site ID.
 * @param state The application state.
 * @param siteId The site for which to retrieve request status.
 * @returns True if policies are being requested; otherwise, false.
 */
const isRequestingRewindPolicies = ( state: AppState, siteId: number | null ): boolean =>
	getRewindPoliciesRequestStatus( state, siteId ) === 'pending';

export default isRequestingRewindPolicies;
