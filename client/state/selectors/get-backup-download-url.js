/**
 * Internal dependencies
 */
import getBackupProgressForRewindId from './get-backup-progress-for-rewind-id';

/**
 * Returns the url of a download if it is ready, null otherwise
 *
 * @param {object} state Global state tree
 * @param {?number|string} siteId the site ID
 * @param {?number|string} rewindId the rewindId of the backup we are interested in
 * @returns {?string} the url of the download, otherwise null
 */
/*@__INLINE__*/
export default function getBackupDownloadUrl( state, siteId, rewindId ) {
	const maybeProgress = getBackupProgressForRewindId( state, siteId, rewindId );
	return maybeProgress && maybeProgress.url ? maybeProgress.url : null;
}
