/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * Returns the requested rewind Activity ID.
 *
 * @param  {Object}        state  Global state tree
 * @param  {number|string} siteId Site ID
 * @return {?Object}              Activity log item if found, otherwise null
 */
export default function getRequestedRewind( state, siteId ) {
	return get( state, [ 'activityLog', 'restoreRequest', siteId ], null );
}
