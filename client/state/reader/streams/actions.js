/**
 * Internal Dependencies
 */
import {
	READER_STREAMS_PAGE_REQUEST,
	READER_STREAMS_PAGE_RECEIVE,
	READER_STREAMS_SHOW_UPDATES,
	READER_STREAMS_SELECT_ITEM,
	READER_STREAMS_FILL_GAP,
	READER_STREAMS_DISMISS_POST,
	READER_STREAMS_SHUFFLE_POSTS
} from 'state/action-types';

/**
 * Fetch posts into a stream
 *
 * This action will fetch a range of posts for a stream and then dispatch
 * READER_STREAM_PAGE_RECEIVE when the page returns. This is usually used to
 * fetch the next page of results, but could be used to fetch arbitrary ranges.
 * @param  {string} streamId The stream to fetch posts for
 * @param  {object} range    The range of posts. Parameters vary by stream type.
 * @return {Promise}          A promise that fulfils when the page returns.
 */
export function requestPage( streamId, query ) {
	return {
		type: READER_STREAMS_PAGE_REQUEST,
		streamId,
		query
	};
}

export function receivePage( streamId, query, page ) {
	return {
		type: READER_STREAMS_PAGE_RECEIVE,
		streamId,
		query,
		payload: page,
	}
}

export function showUpdates( streamId ) {
	return {
		type: READER_STREAMS_SHOW_UPDATES,
		streamId,
	};
}

export function selectItem( streamId, postId ) {
	return {
		type: READER_STREAMS_SELECT_ITEM,
		streamId,
		postId,
	};
}

export function fillGap( streamId, gap ) {
	return {
		type: READER_STREAMS_FILL_GAP,
		streamId,
		gap,
	};
}

export function dismissPost( streamId, postId ) {
	return {
		type: READER_STREAMS_DISMISS_POST,
		streamId,
		postId
	};
}

export function shufflePosts( streamId ) {
	return {
		type: READER_STREAMS_SHUFFLE_POSTS,
		streamId
	};
}
