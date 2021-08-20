/**
 * Internal dependencies
 */
import getRewindState from 'calypso/state/selectors/get-rewind-state';

/**
 * Type dependencies
 */
import type { AppState } from 'calypso/types';

// TODO: Remove once real data is available.
const FAKE_STORAGE_AVAILABLE = 200;

/**
 * Retrieves the amount of Jetpack Backup storage a given site has available, in gigabytes.
 *
 * @param state The application state.
 * @param siteId The site ID for which to retrieve storage usage.
 * @returns The number of gigabytes (GB) available for Backup storage on the given site.
 */
const getSiteBackupStorageAvailable = ( state: AppState, siteId: number ): number | undefined =>
	getRewindState( state, siteId ).storageAvailable ?? FAKE_STORAGE_AVAILABLE;

export default getSiteBackupStorageAvailable;
