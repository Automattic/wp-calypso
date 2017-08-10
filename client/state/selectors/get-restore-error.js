/** @format */
/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * Returns the error for a restore request
 *
 * @param {Object} state Global state tree
 * @param {Number|String} siteId the site ID
 * @return {?Object} Error object, null if no data
 */
export default function getRestoreError( state, siteId ) {
	return get( state, [ 'activityLog', 'restoreError', siteId ], null );
}
