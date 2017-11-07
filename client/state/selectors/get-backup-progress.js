/** @format */
/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * Returns the progress of a backup request
 *
 * @param {Object} state Global state tree
 * @param {Number|String} siteId the site ID
 * @return {?Object} Progress object, null if no data
 */
export default function getBackupProgress( state, siteId ) {
	return get( state, [ 'activityLog', 'backupProgress', siteId ], null );
}
