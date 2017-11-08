/** @format */
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
} from 'state/action-types';

/**
 * Fetch posts into a stream
 *
 * This action will fetch a range of posts for a stream and then dispatch
 * READER_STREAM_PAGE_RECEIVE when the page returns. This is usually used to
 * fetch the next page of results, but could be used to fetch arbitrary ranges.
 * @param  {string} streamId The stream to fetch posts for
 * @param  {object} query    The query for posts. Parameters vary by stream type.
 * @return {object}          The action object
 */
export function requestPage( { streamId, query } ) {
	return {
		type: READER_STREAMS_PAGE_REQUEST,
		payload: {
			streamId,
			query,
		},
	};
}

export function receivePage( { streamId, query, posts } ) {
	return {
		type: READER_STREAMS_PAGE_RECEIVE,
		payload: {
			streamId,
			query,
			posts,
		},
	};
}

export function showUpdates( { streamId } ) {
	return {
		type: READER_STREAMS_SHOW_UPDATES,
		payload: {
			streamId,
		},
	};
}

export function selectItem( { streamId, index } ) {
	return {
		type: READER_STREAMS_SELECT_ITEM,
		payload: {
			streamId,
			index,
		},
	};
}

export function fillGap( { streamId, gap } ) {
	return {
		type: READER_STREAMS_FILL_GAP,
		payload: {
			streamId,
			gap,
		},
	};
}

export function dismissPost( { streamId, postId } ) {
	return {
		type: READER_STREAMS_DISMISS_POST,
		payload: {
			streamId,
			postId,
		},
	};
}
