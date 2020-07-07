/**
 * Internal dependencies
 */
import getBackupProgress from './get-backup-progress';

/**
 * Returns the downloadId of a download IF it is in-progress.
 *
 * @param {object} state Global state tree
 * @param {?number|string} siteId the site ID
 * @returns {?number} the downloadId if the download is in progress, null otherwise
 */
export default function getBackupInProgressDownloadId( state, siteId ) {
	const maybeProgress = getBackupProgress( state, siteId );
	return maybeProgress ? maybeProgress.downloadId : null;
}
