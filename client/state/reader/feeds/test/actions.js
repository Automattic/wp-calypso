/**
 * Internal dependencies
 */
import {
	requestFeed,
	receiveReaderFeedRequestSuccess,
	receiveReaderFeedRequestFailure,
} from '../actions';
import {
	READER_FEED_REQUEST,
	READER_FEED_REQUEST_SUCCESS,
	READER_FEED_REQUEST_FAILURE,
} from 'calypso/state/reader/action-types';

describe( 'actions', () => {
	describe( '#requestFeed', () => {
		test( 'should return an action when a feed is requested', () => {
			const action = requestFeed( 123 );
			expect( action ).toEqual( {
				type: READER_FEED_REQUEST,
				payload: { ID: 123 },
			} );
		} );
	} );

	describe( '#receiveReaderFeedRequestSuccess', () => {
		test( 'should return an action when a feed request succeeds', () => {
			const action = receiveReaderFeedRequestSuccess( { feed_ID: 123 } );
			expect( action ).toEqual( {
				type: READER_FEED_REQUEST_SUCCESS,
				payload: { feed_ID: 123 },
			} );
		} );
	} );

	describe( '#receiveReaderFeedRequestFailure', () => {
		test( 'should return an action when a feed request fails', () => {
			const action = receiveReaderFeedRequestFailure( 123, { statusCode: 410 } );
			expect( action ).toEqual( {
				type: READER_FEED_REQUEST_FAILURE,
				payload: { feed_ID: 123 },
				error: { statusCode: 410 },
			} );
		} );
	} );
} );
