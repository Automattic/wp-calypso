/** @format */

/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * Retrieves the fetching state for WordPress community events
 *
 * @param {Object} state Global state tree
 * @returns {boolean} Fetching, or not fetching
 */
export default function isRequestingCommunityEvents( state ) {
	return get( state, 'communityEvents.isLoading', true );
}
