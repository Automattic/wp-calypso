/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import { SECTION_FOLLOWING, SECTION_NETWORK } from 'state/reader/seen-posts/constants';

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

/**
 * Check if the given subsection has unseen content
 *
 * @param state redux state
 * @param streamKey section stream key
 *
 * @returns {boolean|*} whether or not the subsection has unseen
 */
export const subSectionHasUnseen = ( state, streamKey ) => {
	if ( ! streamKey ) {
		return false;
	}

	const parts = streamKey.split( ':' );
	const siteId = parts[ 1 ];
	let section = SECTION_FOLLOWING;
	if ( parts[ 0 ] === 'site' ) {
		section = SECTION_NETWORK;
	}

	return get(
		state,
		[ 'reader', 'seenPosts', 'unseenStatus', section, 'subsections', siteId ],
		false
	);
};
