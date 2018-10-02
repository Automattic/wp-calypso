/** @format */

/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * Retrieves a list of WordPress community events
 *
 * @param {Object} state Global state tree
 * @returns {Array} List of events
 */
export default function getCommunityEvents( state ) {
	return get( state, 'communityEvents.events', [] );
}
