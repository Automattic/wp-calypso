/**
 * External dependencies
 */
import { get } from 'lodash';

export const getSectionsStatus = ( state ) => {
	return get( state, [ 'reader', 'seenPosts', 'unseenStatus' ], {} );
};

export const sectionHasUnseen = ( state, section ) => {
	// get watermark
	// get number of posts after watermark
	// status from redux
	return get( state, [ 'reader', 'seenPosts', 'unseenStatus', section, 'status' ], false );
};
