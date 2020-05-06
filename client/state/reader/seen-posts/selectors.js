/**
 * External dependencies
 */
import { get } from 'lodash';

export const getSectionsStatus = ( state ) => {
	return state.reader.seenPosts.status;
};

export const sectionHasUnseen = ( state, section ) => {
	// get watermark
	// get number of posts after watermark
	// status from redux
	return get( state, [ 'reader', 'seenPosts', 'status', section, 'status' ], false );
};
