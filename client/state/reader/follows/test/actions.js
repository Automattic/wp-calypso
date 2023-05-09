import {
	READER_FOLLOW_ERROR,
	READER_SUBSCRIBE_TO_NEW_POST_NOTIFICATIONS,
	READER_UNSUBSCRIBE_TO_NEW_POST_NOTIFICATIONS,
} from 'calypso/state/reader/action-types';
import {
	recordFollowError,
	subscribeToNewPostNotifications,
	unsubscribeToNewPostNotifications,
} from '../actions';

jest.mock( 'calypso/state/reader/posts/actions', () => ( {
	receivePosts: ( posts ) => Promise.resolve( posts ),
} ) );

describe( 'actions', () => {
	describe( '#recordFollowError', () => {
		test( 'should return an action on follow error', () => {
			const action = recordFollowError( 'http://discover.wordpress.com', 'invalid_feed' );
			expect( action ).toEqual( {
				type: READER_FOLLOW_ERROR,
				payload: { feedUrl: 'http://discover.wordpress.com', error: 'invalid_feed' },
			} );
		} );
	} );

	describe( '#subscribeToNewPostNotifications', () => {
		test( 'should return an action on new post notification subscribe', () => {
			const action = subscribeToNewPostNotifications( 123 );
			expect( action ).toEqual( {
				type: READER_SUBSCRIBE_TO_NEW_POST_NOTIFICATIONS,
				payload: { blogId: 123 },
			} );
		} );
	} );

	describe( '#unsubscribeToNewPostNotifications', () => {
		test( 'should return an action on new post notification unsubscribe', () => {
			const action = unsubscribeToNewPostNotifications( 123 );
			expect( action ).toEqual( {
				type: READER_UNSUBSCRIBE_TO_NEW_POST_NOTIFICATIONS,
				payload: { blogId: 123 },
			} );
		} );
	} );
} );
