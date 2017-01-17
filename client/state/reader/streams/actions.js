/**
 * Internal Dependencies
 */
import {
	READER_STREAM_PAGE_REQUEST,
	READER_STREAM_PAGE_REQUEST_SUCCESS,
	READER_STREAM_PAGE_REQUEST_ERROR,
	READER_STREAM_PAGE_RECEIVE
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
export function fetchPosts( streamId, range ) {
	return ( dispatch ) => {
		const fetcher = fetcherForStream( streamId );

		dispatch( {
			type: READER_STREAM_PAGE_REQUEST,
			streamId
		} );

		return fetcher( { range } ).then(
			( response ) => {
				dispatch( {
					type: READER_STREAM_PAGE_REQUEST_SUCCESS,
					streamId
				} );

				dispatch( {
					type: READER_STREAM_PAGE_RECEIVE,
					payload: response
				} );
				return response;
			},
			( error ) => {
				dispatch( {
					type: READER_STREAM_PAGE_REQUEST_ERROR,
					streamId,
					error
				} );

			}
		)
	}
}

export function showUpdates() {

}

export function selectNextItem() {

}

export function selectPreviousItem() {

}

export function selectItem() {

}

export function fillGap() {

}

export function dismissPost() {

}

export function shufflePosts() {

}
