import { get } from 'lodash';

import 'calypso/state/activity-log/init';

/**
 * Returns the requested backup Activity ID.
 *
 * @param  {Object}        state  Global state tree
 * @param  {number|string} siteId Site ID
 * @returns {?Object}              Activity log item if found, otherwise null
 */
export default function getRequestedBackup( state, siteId ) {
	return get( state, [ 'activityLog', 'backupRequest', siteId ], null );
}
