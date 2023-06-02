import type { AppState } from 'calypso/types';

/**
 * Retrieves the computed allowed days of backups as per the storage usage.
 *
 * @param state The application state.
 * @param siteId The site ID for which to retrieve days of backups.
 * @returns The maximum number of the days of backups allowed for the given site.
 */
const getRewindDaysOfBackupsAllowed = ( state: AppState, siteId: number ): number | undefined =>
	state.rewind[ siteId ]?.size?.daysOfBackupsAllowed ?? undefined;

export default getRewindDaysOfBackupsAllowed;
