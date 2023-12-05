import { StorageUsageLevelName, StorageUsageLevels } from '../storage/types';
import type { AppState } from 'calypso/types';

/**
 * Retrieves the storage usage level.
 * @param state The application state.
 * @param siteId The site ID for which to retrieve storage usage level.
 * @returns The rewind storage usage level (Normal|Warning|Critical|Full|BackupsDiscarded).
 */
const getRewindStorageUsageLevel = ( state: AppState, siteId: number ): StorageUsageLevelName =>
	state.rewind[ siteId ]?.storage?.usageLevel ?? StorageUsageLevels.Normal;

export default getRewindStorageUsageLevel;
