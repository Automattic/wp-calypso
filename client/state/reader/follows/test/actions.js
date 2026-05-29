import { readSiteQuery } from '@automattic/api-queries';
import { getCalypsoQueryClient } from 'calypso/state/query-client';
import {
	READER_FOLLOW_ERROR,
	READER_FOLLOW,
	READER_SUBSCRIBE_TO_NEW_POST_NOTIFICATIONS,
	READER_UNSUBSCRIBE_TO_NEW_POST_NOTIFICATIONS,
	READER_UNFOLLOW,
} from 'calypso/state/reader/action-types';
import {
	follow,
	recordFollowError,
	subscribeToNewPostNotifications,
	unfollow,
	unsubscribeToNewPostNotifications,
} from '../actions';

jest.mock( 'calypso/state/query-client', () => ( {
	getCalypsoQueryClient: jest.fn(),
} ) );

describe( 'actions', () => {
	beforeEach( () => {
		getCalypsoQueryClient.mockReset();
	} );

	describe( '#follow', () => {
		test( 'should return an action when following a feed URL', () => {
			expect( follow( 'http://discover.wordpress.com/feed' ) ).toEqual( {
				type: READER_FOLLOW,
				payload: { feedUrl: 'http://discover.wordpress.com/feed' },
			} );
		} );

		test( 'should mark a matching cached Reader site as followed', () => {
			const queryKey = readSiteQuery( 123 ).queryKey;
			const cachedSite = {
				ID: 123,
				feed_URL: 'http://discover.wordpress.com/feed',
				is_following: false,
			};
			const queryClient = {
				getQueriesData: jest.fn( () => [ [ queryKey, cachedSite ] ] ),
				setQueryData: jest.fn(),
			};
			getCalypsoQueryClient.mockReturnValue( queryClient );

			follow( 'http://discover.wordpress.com/feed' );

			expect( queryClient.setQueryData ).toHaveBeenCalledWith( queryKey, {
				...cachedSite,
				is_following: true,
			} );
		} );
	} );

	describe( '#unfollow', () => {
		test( 'should return an action when unfollowing a feed URL', () => {
			expect( unfollow( 'http://discover.wordpress.com/feed' ) ).toEqual( {
				type: READER_UNFOLLOW,
				payload: { feedUrl: 'http://discover.wordpress.com/feed' },
			} );
		} );

		test( 'should mark a matching cached Reader site as unfollowed', () => {
			const queryKey = readSiteQuery( 123 ).queryKey;
			const cachedSite = {
				ID: 123,
				feed_URL: 'http://discover.wordpress.com/feed',
				is_following: true,
			};
			const queryClient = {
				getQueriesData: jest.fn( () => [ [ queryKey, cachedSite ] ] ),
				setQueryData: jest.fn(),
			};
			getCalypsoQueryClient.mockReturnValue( queryClient );

			unfollow( 'http://discover.wordpress.com/feed' );

			expect( queryClient.setQueryData ).toHaveBeenCalledWith( queryKey, {
				...cachedSite,
				is_following: false,
			} );
		} );

		test( 'should mark a cached Reader site as unfollowed when the feed URL differs only by protocol or trailing slash', () => {
			const queryKey = readSiteQuery( 123 ).queryKey;
			const cachedSite = {
				ID: 123,
				feed_URL: 'https://discover.wordpress.com/feed/',
				is_following: true,
			};
			const queryClient = {
				getQueriesData: jest.fn( () => [ [ queryKey, cachedSite ] ] ),
				setQueryData: jest.fn(),
			};
			getCalypsoQueryClient.mockReturnValue( queryClient );

			unfollow( 'http://discover.wordpress.com/feed' );

			expect( queryClient.setQueryData ).toHaveBeenCalledWith( queryKey, {
				...cachedSite,
				is_following: false,
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
