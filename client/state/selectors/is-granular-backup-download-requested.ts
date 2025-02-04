import { AppState } from 'calypso/types';
import 'calypso/state/activity-log/init';

/**
 * Returns whether a granular backup download has been requested
 * for a given site.
 * @param {Object} state Global state tree
 * @param {number} siteId The site ID
 * @returns {boolean} Whether a granular backup download has been requested
 */
const isGranularBackupDownloadRequested = ( state: AppState, siteId: number ): boolean => {
	return state.activityLog.granularBackupDownloadRequested?.[ siteId ] ?? false;
};

export default isGranularBackupDownloadRequested;
