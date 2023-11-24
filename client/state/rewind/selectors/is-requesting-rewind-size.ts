import getRewindSizeRequestStatus from './get-rewind-size-request-status';
import type { AppState } from 'calypso/types';

/**
 * Returns whether or not Rewind site size information is currently being
 * requested for a given site ID.
 * @param state The application state.
 * @param siteId The site for which to retrieve request status.
 * @returns True if size info is being requested; otherwise, false.
 */
const isRequestingRewindSize = ( state: AppState, siteId: number | null ): boolean =>
	getRewindSizeRequestStatus( state, siteId ) === 'pending';

export default isRequestingRewindSize;
