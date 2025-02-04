import type { AppState } from 'calypso/types';

/**
 * Returns whether or not Rewind backups are initialized/set for a given site ID.
 * @param state The application state.
 * @param siteId The site for which to retrieve request status.
 * @returns True if backups have been initialized/set; otherwise, false.
 */
const isRewindBackupsInitialized = ( state: AppState, siteId: number ): boolean => {
	return state.rewind?.[ siteId ]?.backups?.isInitialized;
};

export default isRewindBackupsInitialized;
