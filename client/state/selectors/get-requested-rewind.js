/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import 'calypso/state/activity-log/init';

/**
 * Returns the requested rewind Activity ID.
 *
 * @param  {object}        state  Global state tree
 * @param  {?number|string} siteId Site ID
 * @returns {?object}              Activity log item if found, otherwise null
 */
export default function getRequestedRewind( state, siteId ) {
	return get( state, [ 'activityLog', 'restoreRequest', siteId ], null );
}
