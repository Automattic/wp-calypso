/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import { SECTION_FOLLOWING, SECTION_NETWORK } from 'state/reader/seen-posts/constants';

export const getSectionsStatus = ( state ) => {
	return get( state, [ 'reader', 'seenPosts', 'unseenStatus' ], {} );
};

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

export const sectionHasUnseen = ( state, section ) => {
	// get watermark
	// get number of posts after watermark
	// status from redux
	return get( state, [ 'reader', 'seenPosts', 'unseenStatus', section, 'status' ], false );
};
