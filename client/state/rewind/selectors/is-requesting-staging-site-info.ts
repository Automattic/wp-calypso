import type { AppState } from 'calypso/types';

/**
 * Returns whether or not backup staging site info is being
 * requested for a given site ID.
 * @param state The application state.
 * @param siteId The site for which to retrieve request status.
 * @returns true if staging site info are being requested; otherwise, false.
 */
const isRequestingStagingSiteInfo = ( state: AppState, siteId: number ): boolean =>
	state.rewind[ siteId ]?.staging?.site?.isFetching || false;

export default isRequestingStagingSiteInfo;
