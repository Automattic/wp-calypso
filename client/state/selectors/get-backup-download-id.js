/**
 * Internal dependencies
 */
import getBackupProgressForRewindId from './get-backup-progress-for-rewind-id';

/**
 * Returns the downloadId of a download IF it is in-progress.
 *
 * @param {object} state Global state tree
 * @param {?number|string} siteId the site ID
 * @param {?number|string} rewindId the rewindId of the backup we are interested in
 * @returns {?number} the downloadId if the download is in progress, null otherwise
 */
/*@__INLINE__*/
export default function getBackupInProgressDownloadId( state, siteId, rewindId ) {
	const maybeProgress = getBackupProgressForRewindId( state, siteId, rewindId );
	return maybeProgress && ! maybeProgress.url && maybeProgress.downloadId
		? maybeProgress.downloadId
		: null;
}
