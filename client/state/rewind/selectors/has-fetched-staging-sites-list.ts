import type { AppState } from 'calypso/types';

/**
 * Returns whether or not backup staging sites list has been
 * fetched for a given site ID.
 * @param state The application state.
 * @param siteId The site for which to valida if staging sites has been fetched.
 * @returns true if staging sites has been fetched; otherwise, false.
 */
const hasFetchedStagingSitesList = ( state: AppState, siteId: number ): boolean =>
	state.rewind[ siteId ]?.staging?.stagingSitesList?.hasFetchedStagingSitesList || false;

export default hasFetchedStagingSitesList;
