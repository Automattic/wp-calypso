/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * Get section unseen data
 *
 * @param state redux state
 *
 * @returns {*} section unseen status data
 */
export const getSectionsStatus = ( state ) => {
	return get( state, [ 'reader', 'seenPosts', 'unseenStatus' ], {} );
};

/**
 * Check if the given section has unseen content
 *
 * @param state redux state
 * @param section identifier
 * @returns {boolean} section unseen status
 */
export const sectionHasUnseen = ( state, section ) => {
	// get watermark
	// get number of posts after watermark
	// status from redux
	return get( state, [ 'reader', 'seenPosts', 'unseenStatus', section, 'status' ], false );
};
