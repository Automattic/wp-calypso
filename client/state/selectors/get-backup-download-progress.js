/**
 * Internal dependencies
 */
import getBackupProgressForRewindId from './get-backup-progress-for-rewind-id';
/**
 * Returns the progress of a backup request as a number out of 100
 *
 * @param {object} state Global state tree
 * @param {?number|string} siteId the site ID
 * @param {?number|string} rewindId the rewindId of the backup we are interested in
 * @returns {?number} the progress of the download, if any, out of 100
 */
export default function getBackupDownloadProgress( state, siteId, rewindId ) {
	const maybeProgress = getBackupProgressForRewindId( state, siteId, rewindId );
	return maybeProgress && maybeProgress.hasOwnProperty( 'progress' )
		? maybeProgress.progress
		: null;
}
