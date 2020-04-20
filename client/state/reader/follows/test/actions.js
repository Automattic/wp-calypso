/**
 * Internal dependencies
 */
import {
	recordFollow,
	recordUnfollow,
	recordFollowError,
	subscribeToNewPostNotifications,
	unsubscribeToNewPostNotifications,
} from '../actions';
import {
	READER_RECORD_FOLLOW,
	READER_RECORD_UNFOLLOW,
	READER_FOLLOW_ERROR,
	READER_SUBSCRIBE_TO_NEW_POST_NOTIFICATIONS,
	READER_UNSUBSCRIBE_TO_NEW_POST_NOTIFICATIONS,
} from 'state/reader/action-types';

jest.mock( 'state/reader/posts/actions', () => ( {
	receivePosts: ( posts ) => Promise.resolve( posts ),
} ) );

describe( 'actions', () => {
	describe( '#recordFollow', () => {
		test( 'should dispatch an action when a URL is followed', () => {
			const dispatchSpy = jest.fn();
			recordFollow( 'http://discover.wordpress.com' )( dispatchSpy );
			expect( dispatchSpy ).toHaveBeenCalledWith( {
				type: READER_RECORD_FOLLOW,
				payload: { url: 'http://discover.wordpress.com' },
			} );
		} );
	} );

	describe( '#recordUnfollow', () => {
		test( 'should dispatch an action when a URL is unfollowed', () => {
			const dispatchSpy = jest.fn();
			recordUnfollow( 'http://discover.wordpress.com' )( dispatchSpy );
			expect( dispatchSpy ).toHaveBeenCalledWith( {
				type: READER_RECORD_UNFOLLOW,
				payload: { url: 'http://discover.wordpress.com' },
			} );
		} );
	} );

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
