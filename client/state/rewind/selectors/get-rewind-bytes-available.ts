import type { AppState } from 'calypso/types';

/**
 * Retrieves the number of bytes of storage a given site has available, according to Rewind.
 * @param state The application state.
 * @param siteId The site ID for which to retrieve available storage.
 * @returns The number of bytes of storage available for use by the given site.
 */
const getRewindBytesAvailable = ( state: AppState, siteId: number ): number | undefined =>
	state.rewind[ siteId ]?.policies?.storageLimitBytes ?? undefined;

export default getRewindBytesAvailable;
