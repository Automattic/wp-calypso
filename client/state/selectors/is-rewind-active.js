/** @format */
/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * Returns true if the Activity Log Rewind feature
 * is enabled for a site.
 *
 * @param {Object} state Global state tree
 * @param {number|string} siteId the site ID
 * @return {boolean} true if rewind is enabled
 */
export default function isRewindActive( state, siteId ) {
	return !! get( state.activityLog.rewindStatus, [ siteId, 'active' ], false );
}
