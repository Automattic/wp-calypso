/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import 'calypso/state/activity-log/init';

/**
 * Returns the error for a restore request
 *
 * @param {object} state Global state tree
 * @param {number|string} siteId the site ID
 * @returns {?object} Error object, null if no data
 */
export default function getRestoreError( state, siteId ) {
	return get( state, [ 'activityLog', 'restoreError', siteId ], null );
}
