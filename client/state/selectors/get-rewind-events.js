/** @format */
/**
 * External dependencies
 */
import { get, values } from 'lodash';

/**
 * Internal dependencies
 */
import { getRewinds } from 'state/activity-log/log/is-discarded';

const cache = new WeakMap();

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

	if ( cache.has( siteEvents ) ) {
		return cache.get( siteEvents );
	}

	const rewinds = getRewinds( values( siteEvents ) );

	cache.set( siteEvents, rewinds );

	return rewinds;
};

export default getRewindEvents;
