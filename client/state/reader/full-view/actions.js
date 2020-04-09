/**
 * Internal dependencies
 */
import { READER_FULL_VIEW_POST_KEY_SET } from 'state/reader/action-types';

export const setReaderFullViewPostKey = postKey => ( {
	type: READER_FULL_VIEW_POST_KEY_SET,
	postKey,
} );
