/**
 * Internal dependencies
 */
import getBackupProgress from './get-backup-progress';

/**
 * Returns the rewindId of a download IF it is in-progress.
 *
 * @param {object} state Global state tree
 * @param {?number|string} siteId the site ID
 * @returns {?string} the rewindId
 */
export default function getBackupInProgressRewindId( state, siteId ) {
	const maybeProgress = getBackupProgress( state, siteId );
	return maybeProgress ? maybeProgress.rewindId : null;
}
