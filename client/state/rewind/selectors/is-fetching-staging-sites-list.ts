import type { AppState } from 'calypso/types';

/**
 * Returns whether or not backup staging sites list is being
 * requested for a given site ID.
 * @param state The application state.
 * @param siteId The site for which to retrieve request status.
 * @returns true if staging sites are being requested; otherwise, false.
 */
const isFetchingStagingSitesList = ( state: AppState, siteId: number ): boolean =>
	state.rewind[ siteId ]?.staging?.stagingSitesList?.isFetchingStagingSitesList || false;

export default isFetchingStagingSitesList;
