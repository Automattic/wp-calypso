/** @format *
/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * Returns an Activity log.
 *
 * @param  {Object}        state      Global state tree
 * @param  {number|string} siteId     the site ID
 * @param  {string}        activityId Activity ID
 * @return {?Object}                  Activity log item if found, otherwise null
 */
export default function getActivityLog( state, siteId, activityId ) {
	const manager = get( state, [ 'activityLog', 'logItems', siteId ], null );
	if ( ! manager ) {
		return null;
	}

	return manager.getItem( activityId );
}
