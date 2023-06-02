import type { AppState } from 'calypso/types';

/**
 * Retrieves number of days with valid backups saved.
 *
 * @param state The application state.
 * @param siteId The site ID for which to retrieve days of backups saved.
 * @returns The number of days of backups saved for the given site.
 */
const getRewindDaysOfBackupsSaved = ( state: AppState, siteId: number ): number | undefined =>
	state.rewind[ siteId ]?.size?.daysOfBackupsSaved ?? undefined;

export default getRewindDaysOfBackupsSaved;
