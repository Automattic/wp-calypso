/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * Returns the downloadId of a download IF it is in-progress.
 *
 * @param {object} state Global state tree
 * @param {?number|string} siteId the site ID
 * @returns {?number} the downloadId if the download is in progress, null otherwise
 */
export default function getBackupAnyInProgressDownloadId( state, siteId ) {
	const maybeProgress = get( state, [ 'activityLog', 'backupProgress', siteId ], null );
	return maybeProgress && ! maybeProgress.url && maybeProgress.downloadId
		? maybeProgress.downloadId
		: null;
}
