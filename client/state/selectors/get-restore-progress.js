/**
 * External dependencies
 */

import { get } from 'lodash';

/**
 * Returns the progress of a restore request
 *
 * @param {object} state Global state tree
 * @param {number|String} siteId the site ID
 * @return {?object} Progress object, null if no data
 */
export default function getRestoreProgress( state, siteId ) {
	return get( state, [ 'activityLog', 'restoreProgress', siteId ], null );
}
