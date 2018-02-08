/**
 * @format
 * @jest-environment jsdom
 */

/**
 * External dependencies
 */

/**
 * Internal dependencies
 */
import { action as FeedStreamActionType } from 'lib/feed-stream-store/constants';
import { action as FeedPostActionType } from 'lib/feed-post-store/constants';
import { READER_POSTS_RECEIVE } from 'state/action-types';

jest.mock( 'lib/analytics', () => ( {} ) );
jest.mock( 'lib/post-normalizer', () => require( './mocks/lib/post-normalizer' ) );
jest.mock( 'lib/wp', () => require( './mocks/lib/wp' ) );
jest.mock( 'lib/redux-bridge', () => ( {
	reduxGetState: function() {
		return { reader: { posts: { items: {} } } };
	},
	reduxDispatch: jest.fn(),
} ) );

const reduxDispatch = require( 'lib/redux-bridge' ).reduxDispatch;

let Dispatcher, FeedPostStore;

describe( 'feed-post-store', () => {
	beforeAll( () => {
		Dispatcher = require( 'dispatcher' );

		FeedPostStore = require( '../' );
	} );

	beforeEach( () => {
		reduxDispatch.mockClear();
	} );

	test( 'should have a dispatch token', () => {
		expect( FeedPostStore ).toHaveProperty( 'dispatchToken' );
	} );

	test( 'should send post from a feed page over the redux bridge', () => {
		const post = { feed_ID: 1, feed_item_ID: 1, global_ID: 1 };

		Dispatcher.handleServerAction( {
			type: FeedStreamActionType.RECEIVE_PAGE,
			data: { posts: [ post ] },
			error: null,
		} );

		const expectedPosts = [ { ...post, _state: 'minimal' } ];
		expect( reduxDispatch ).toBeCalledWith( {
			type: READER_POSTS_RECEIVE,
			posts: expect.arrayContaining( expectedPosts ),
		} );
	} );

	test( 'should save a post from a blog page', () => {
		const post = { ID: 2, global_ID: 1, site_ID: 1 };
		Dispatcher.handleServerAction( {
			type: FeedStreamActionType.RECEIVE_PAGE,
			data: { posts: [ post ] },
			error: null,
		} );

		const expectedPosts = [ { ...post, _state: 'minimal' } ];
		expect( reduxDispatch ).toBeCalledWith( {
			type: READER_POSTS_RECEIVE,
			posts: expect.arrayContaining( expectedPosts ),
		} );
	} );

	test( 'should ignore a post from a page without the right ID', () => {
		Dispatcher.handleServerAction( {
			type: FeedStreamActionType.RECEIVE_PAGE,
			data: { posts: [ { junk: '' } ] },
			error: null,
		} );

		expect( reduxDispatch.mock.calls.length ).toBe( 0 );
	} );

	test( 'should ignore a post from a page with an error', () => {
		Dispatcher.handleServerAction( {
			type: FeedStreamActionType.RECEIVE_PAGE,
			data: { posts: [ { global_ID: 1 } ] },
			error: new Error(),
		} );

		expect( reduxDispatch.mock.calls.length ).toBe( 0 );
	} );

	test( 'should normalize a received post and send it across the redux bridge', () => {
		const post = {
			global_ID: 1000,
			feed_ID: 1,
			feed_item_ID: 2,
			title: 'chris & ben',
		};

		Dispatcher.handleServerAction( {
			type: FeedPostActionType.RECEIVE_FEED_POST,
			data: post,
			feedId: 1,
			postId: 2,
			error: null,
		} );

		const expectedPosts = [ expect.objectContaining( { ...post } ) ];
		expect( reduxDispatch ).toBeCalledWith( {
			type: READER_POSTS_RECEIVE,
			posts: expect.arrayContaining( expectedPosts ),
		} );
	} );

	test( 'should send an internal post across the redux bridge', () => {
		const post = {
			feed_id: 1,
			feed_item_ID: 2,
			ID: 3, // notice this can and will be different for wpcom posts
			site_ID: 4,
			title: 'a sample post',
			global_ID: 1,
		};
		Dispatcher.handleServerAction( {
			type: FeedPostActionType.RECEIVE_FEED_POST,
			data: post,
			feedId: 1,
			postId: 2,
			error: null,
		} );

		expect( reduxDispatch ).toBeCalledWith( {
			type: READER_POSTS_RECEIVE,
			posts: expect.arrayContaining( [ expect.objectContaining( post ) ] ),
		} );
	} );

	test( 'should send a post without a feed_ID across the bridge', () => {
		const post = {
			global_ID: 1,
			ID: 3, // notice this can and will be different for wpcom posts
			site_ID: 4,
			title: 'a sample post',
		};
		Dispatcher.handleServerAction( {
			type: FeedPostActionType.RECEIVE_FEED_POST,
			data: post,
			blogId: 4,
			postId: 3,
			error: null,
		} );

		expect( reduxDispatch ).toBeCalledWith( {
			type: READER_POSTS_RECEIVE,
			posts: expect.arrayContaining( [ expect.objectContaining( post ) ] ),
		} );
	} );
} );
