import type { AppState } from 'calypso/types';

/**
 * Returns whether or not backup staging site info has been
 * fetched for a given site ID.
 * @param state The application state.
 * @param siteId The site for which to valid if staging site info has been fetched.
 * @returns true if staging sites has been fetched; otherwise, false.
 */
const hasFetchedStagingSiteInfo = ( state: AppState, siteId: number ): boolean =>
	state.rewind[ siteId ]?.staging?.site?.hasFetched || false;

export default hasFetchedStagingSiteInfo;
