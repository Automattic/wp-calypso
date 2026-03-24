import {
	READER_FEED_REQUEST_FAILURE,
	READER_FEED_REQUEST_SUCCESS,
} from 'calypso/state/reader/action-types';

import 'calypso/state/data-layer/wpcom/read/feed';

import 'calypso/state/reader/init';

export function receiveReaderFeedRequestSuccess( data ) {
	return {
		type: READER_FEED_REQUEST_SUCCESS,
		payload: data,
	};
}

export function receiveReaderFeedRequestFailure( feedId, error ) {
	return {
		type: READER_FEED_REQUEST_FAILURE,
		payload: { feed_ID: feedId, error: error },
	};
}
