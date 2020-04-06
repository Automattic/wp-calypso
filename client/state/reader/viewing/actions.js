/**
 * Internal Dependencies
 */
import {
	READER_VIEW_FEED_POST_SET,
	READER_VIEW_FEED_POST_UNSET,
	READER_VIEW_FULL_POST_SET,
	READER_VIEW_FULL_POST_UNSET,
} from 'state/reader/action-types';

import 'state/reader/init';

export function setViewFeedPost( { siteId, postId } ) {
	return {
		type: READER_VIEW_FEED_POST_SET,
		payload: { siteId, postId },
	};
}

export function unsetViewFeedPost( { siteId, postId } ) {
	return {
		type: READER_VIEW_FEED_POST_UNSET,
		payload: { siteId, postId },
	};
}

export function setViewFullPost( { siteId, postId } ) {
	return {
		type: READER_VIEW_FULL_POST_SET,
		payload: { siteId, postId },
	};
}

export function unsetViewFullPost( { siteId, postId } ) {
	return {
		type: READER_VIEW_FULL_POST_UNSET,
		payload: { siteId, postId },
	};
}
