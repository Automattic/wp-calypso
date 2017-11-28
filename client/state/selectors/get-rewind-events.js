/** @format */
/**
 * External dependencies
 */
import { get, values } from 'lodash';

/**
 * Internal dependencies
 */
import { getRewinds } from 'state/activity-log/log/is-discarded';

/**
 * Returns all events which represent rewind operations
 * from the activity log for a given site
 *
 * @param {Object} state Redux state
 * @param {Number} siteId requested site
 * @returns {?Array<Object>} list of rewind events
 */
export const getRewindEvents = ( state, siteId ) => {
	const siteEvents = get( state, [ 'activityLog', 'logItems', siteId, 'data', 'items' ] );

	if ( ! siteEvents ) {
		return null;
	}

	return getRewinds( values( siteEvents ) );
};

export default getRewindEvents;
