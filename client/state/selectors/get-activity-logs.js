/** @format *
/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * Returns list of Activity Log items.
 *
 * @param  {Object}        state  Global state tree
 * @param  {number|string} siteId the site ID
 * @param  {?Object}       query  Optional. Query object, passed to ActivityQueryManager.
 * @return {?array}               Activity log item objects. Null if no data.
 */
export default function getActivityLogs( state, siteId, query ) {
	const manager = get( state, [ 'activityLog', 'logItems', siteId ], null );
	if ( ! manager ) {
		return null;
	}

	return manager.getItems( query );
}
