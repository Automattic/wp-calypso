/** @format *
 /**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * Returns an Activity log.
 *
 * @param  {Object}        state      Global state tree
 * @param  {number|string} siteId     The site ID
 * @return {number}                  Timestamp of oldest logged event, otherwise 0.
 */
export default function getOldestItemTs( state, siteId ) {
	return get( state, [ 'activityLog', 'logItems', siteId, 'oldestItemTs' ], 0 );
}
