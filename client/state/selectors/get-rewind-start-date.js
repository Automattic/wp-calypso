/** @format */
/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * Returns the date of the first available rewind point for
 * the Activity Log feature.
 *
 * @param {Object} state Global state tree
 * @param {number|string} siteId the site ID
 * @return {String} Date of first rewind point, empty string if none available
 */
export default function getRewindStartDate( state, siteId ) {
	return get( state.activityLog.rewindStatus, [ siteId, 'firstBackupDate' ], '' );
}
