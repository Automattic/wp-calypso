import type { AppState } from 'calypso/types';

/**
 * Retrieves the minimum allowed days of backups.
 *
 * @param state The application state.
 * @param siteId The site ID for which to retrieve days of backups.
 * @returns The minimum number of the days of backups allowed.
 */
const getRewindMinimumDaysOfBackupsAllowed = (
	state: AppState,
	siteId: number
): number | undefined => state.rewind[ siteId ]?.size?.minDaysOfBackupsAllowed ?? undefined;

export default getRewindMinimumDaysOfBackupsAllowed;
