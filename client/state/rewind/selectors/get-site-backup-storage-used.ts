import getRewindState from 'calypso/state/selectors/get-rewind-state';
import type { AppState } from 'calypso/types';

// TODO: Remove once real data is available.
const FAKE_STORAGE_USED = 200;

/**
 * Retrieves the amount of Jetpack Backup storage a given site has used, in gigabytes.
 *
 * @param state The application state.
 * @param siteId The site ID for which to retrieve storage usage.
 * @returns The number of gigabytes (GB) of stored Jetpack Backups on the given site.
 */
const getSiteBackupStorageUsed = ( state: AppState, siteId: number ): number | undefined =>
	getRewindState( state, siteId ).storageUsed ?? FAKE_STORAGE_USED;

export default getSiteBackupStorageUsed;
