/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * Returns the progress of a backup request
 *
 * @param {object} state Global state tree
 * @param {?number|string} siteId the site ID
 * @param {?number|string} rewindId the rewindId of the backup we are interested in
 * @returns {?object} Progress object, null if no data
 */
export default function getBackupProgressForRewindId( state, siteId, rewindId ) {
	const maybeProgress = get( state, [ 'activityLog', 'backupProgress', siteId ], null );
	return maybeProgress?.rewindId === rewindId ? maybeProgress : null;
}
