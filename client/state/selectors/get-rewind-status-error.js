/** @format */
/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * Returns any error resulting from the request of
 * Activity Log Rewind status for a site.
 *
 * @param {Object} state Global state tree
 * @param {number|string} siteId the site ID
 * @return {Object} error object, or null if no error
 */
export default function getRewindStatusError( state, siteId ) {
	return get( state.activityLog.rewindStatusError, siteId, null );
}
