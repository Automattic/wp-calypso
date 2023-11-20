import type { AppState } from 'calypso/types';

/**
 * Retrieves the retention period (in days) set by the user.
 * @param state The application state.
 * @param siteId The site ID for which to retrieve days of backups.
 * @returns The retention period if set.
 */
const getBackupRetentionDays = ( state: AppState, siteId: number ): number | undefined =>
	state.rewind[ siteId ]?.size?.retentionDays ?? undefined;

export default getBackupRetentionDays;
