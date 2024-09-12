import type { AppState } from 'calypso/types';

/**
 * Indicates if the last backup failed.
 * @param state The application state.
 * @param siteId The site ID for which to backup status.
 * @returns true if backups failed. false otherwise.
 */
const getBackupLastBackupFailed = ( state: AppState, siteId: number ): boolean =>
	state.rewind[ siteId ]?.size?.lastBackupFailed ?? false;

export default getBackupLastBackupFailed;
