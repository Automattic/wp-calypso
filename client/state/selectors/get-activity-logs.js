/** @format */
/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * Returns list of Activity Log items.
 *
 * @param {Object} state Global state tree
 * @param {number|string} siteId the site ID
 * @return {?array} Activity log item objects. Null if no data.
 */
export default function getActivityLogs( state, siteId ) {
	return get( state, [ 'activityLog', 'logItems', siteId ], null );
}
