import { get } from 'lodash';

import 'calypso/state/activity-log/init';

/**
 * Returns the progress of a backup request
 *
 * @param {Object} state Global state tree
 * @param {?number|string} siteId the site ID
 * @returns {?Object} Progress object, null if no data
 */
export default function getBackupProgress( state, siteId ) {
	return get( state, [ 'activityLog', 'backupProgress', siteId ], null );
}
