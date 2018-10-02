/** @format */

/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * Retrieves any error from Community Events fetching
 *
 * @param {Object} state Global state tree
 * @returns {(string|null)} Error message, or null
 */
export default function getCommunityEventsError( state ) {
	return get( state, 'communityEvents.error', null );
}
