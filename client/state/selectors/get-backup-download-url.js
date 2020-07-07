/**
 * Internal dependencies
 */
import getBackupProgress from './get-backup-progress';

/**
 * Returns the url of a download if it is ready, null otherwise
 *
 * @param {object} state Global state tree
 * @param {?number|string} siteId the site ID
 * @returns {?string} the url of the download, otherwise null
 */
export default function getBackupDownloadUrl( state, siteId ) {
	const maybeProgress = getBackupProgress( state, siteId );
	return maybeProgress && maybeProgress.url ? maybeProgress.url : null;
}
