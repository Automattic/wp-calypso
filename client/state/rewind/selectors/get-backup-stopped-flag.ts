import type { AppState } from 'calypso/types';

/**
 * Indicates if the backups are stopped for the site.
 * @param state The application state.
 * @param siteId The site ID for which to backup status.
 * @returns true if backups are stopped false otherwise.
 */
const getBackupStoppedFlag = ( state: AppState, siteId: number ): boolean =>
	state.rewind[ siteId ]?.size?.backupsStopped ?? false;

export default getBackupStoppedFlag;
