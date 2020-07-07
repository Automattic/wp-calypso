/**
 * Internal dependencies
 */
import getBackupProgress from './get-backup-progress';

/**
 * Returns the progress of a backup request as a number out of 100
 *
 * @param {object} state Global state tree
 * @param {?number|string} siteId the site ID
 * @returns {?number} the progress of the download, if any, out of 100
 */
export default function getBackupDownloadProgress( state, siteId ) {
	const maybeProgress = getBackupProgress( state, siteId );
	return maybeProgress &&
		maybeProgress.hasOwnProperty( 'progress' ) &&
		! isNaN( maybeProgress.progress )
		? maybeProgress.progress
		: null;
}
