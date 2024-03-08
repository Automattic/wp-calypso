import type { AppState } from 'calypso/types';

/**
 * Retrieves current site size in bytes.
 * @param state The application state.
 * @param siteId The site ID for which to retrieve days of backups saved.
 * @returns The current site size number in bytes.
 */
const getBackupCurrentSiteSize = ( state: AppState, siteId: number ): number | undefined =>
	state.rewind[ siteId ]?.size?.lastBackupSize ?? undefined;

export default getBackupCurrentSiteSize;
