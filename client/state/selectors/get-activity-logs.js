/** @format *
/**
 * External dependencies
 */
import { get, values } from 'lodash';

const emptyList = [];

/**
 * Returns list of Activity Log items.
 *
 * @param  {Object}        state  Global state tree
 * @param  {number|string} siteId the site ID
 * @param  {?Object}       query  Optional. Query object, passed to ActivityQueryManager.
 * @return {?array}               Activity log item objects. Null if no data.
 */
export default function getActivityLogs( state, siteId ) {
	const events = get( state, [ 'activityLog', 'logItems', siteId, 'data', 'items' ] );

	return events ? values( events ).sort( ( a, b ) => b.rewindId - a.rewindId ) : emptyList;
}
