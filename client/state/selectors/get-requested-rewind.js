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
 * @return {?Object}                  Activity log item if found, otherwise null
 */
export default function getRequestedRewind( state, siteId ) {
	return get( state, [ 'activityLog', 'restoreRequest', siteId ], null );
}
