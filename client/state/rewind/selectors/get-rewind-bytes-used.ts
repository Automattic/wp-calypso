import type { AppState } from 'calypso/types';

/**
 * Retrieves the number of bytes of storage a given site has used, according to Rewind.
 * @param state The application state.
 * @param siteId The site ID for which to retrieve storage usage.
 * @returns The number of bytes of storage used by the given site.
 */
const getRewindBytesUsed = ( state: AppState, siteId: number ): number | undefined =>
	state.rewind[ siteId ]?.size?.bytesUsed ?? undefined;

export default getRewindBytesUsed;
