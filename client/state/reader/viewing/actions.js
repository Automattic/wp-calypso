/**
 * Internal Dependencies
 */
import {
	READER_VIEW_FEED_POST_SET,
	READER_VIEW_FEED_POST_SET_UNSET,
	READER_VIEW_FULL_POST_SET,
	READER_VIEW_FULL_POST_UNSET,
} from 'state/reader/action-types';

import 'state/reader/init';

export function viewFeedPostSet( { siteId, postId } ) {
	return {
		type: READER_VIEW_FEED_POST_SET,
		payload: { siteId, postId },
	};
}

export function viewFeedPostUnset( { siteId, postId } ) {
	return {
		type: READER_VIEW_FEED_POST_SET_UNSET,
		payload: { siteId, postId },
	};
}

export function viewFullPostSet( { siteId } ) {
	return {
		type: READER_VIEW_FULL_POST_SET,
		payload: { siteId },
	};
}

export function viewFullPostUnset( { siteId } ) {
	return {
		type: READER_VIEW_FULL_POST_UNSET,
		payload: { siteId },
	};
}
