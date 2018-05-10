/** @format */

/**
 * Internal dependencies
 */
import * as actions from '../actions';
import { tracks } from 'lib/analytics';
import { READER_POSTS_RECEIVE, READER_POST_SEEN } from 'state/action-types';
import wp from 'lib/wp';

jest.mock( 'reader/stats', () => ( { pageViewForPost: jest.fn() } ) );

jest.mock( 'lib/analytics', () => ( {
	tracks: { recordEvent: jest.fn() },
	mc: { bumpStat: jest.fn() },
} ) );

jest.mock( 'lib/wp', () => {
	const readFeedPost = jest.fn();
	const readSitePost = jest.fn();

	return {
		undocumented: () => ( {
			readFeedPost,
			readSitePost,
		} ),
	};
} );

const undocumented = wp.undocumented;
const { pageViewForPost } = require( 'reader/stats' );
const { mc } = require( 'lib/analytics' );

describe( 'actions', () => {
	const dispatchSpy = jest.fn();
	const trackingSpy = tracks.recordEvent;
	const readFeedStub = undocumented().readFeedPost;
	const readSiteStub = undocumented().readSitePost;

	afterEach( () => {
		dispatchSpy.mockReset();
		trackingSpy.mockReset();
		readFeedStub.mockReset();
		readSiteStub.mockReset();
	} );

	describe( '#receivePosts()', () => {
		test( 'should return an action object and dispatch posts receive', () => {
			const posts = [];
			return actions
				.receivePosts( posts )( dispatchSpy )
				.then( () => {
					expect( dispatchSpy ).toHaveBeenCalledWith( {
						type: READER_POSTS_RECEIVE,
						posts,
					} );
				} );
		} );

		test( 'should fire tracks events for posts with railcars', () => {
			const posts = [
				{
					ID: 1,
					site_ID: 1,
					global_ID: 1,
					railcar: 'foo',
				},
			];
			actions.receivePosts( posts )( dispatchSpy );
			expect( trackingSpy ).toHaveBeenCalledWith( 'calypso_traintracks_render', 'foo' );
		} );

		test( 'should try to reload posts marked with should_reload', () => {
			const posts = [
				{
					ID: 1,
					site_ID: 1,
					global_ID: 1,
					railcar: '1234',
					_should_reload: true,
				},
			];

			actions.receivePosts( posts )( dispatchSpy );
			expect( dispatchSpy ).toHaveBeenCalledWith( expect.any( Function ) );
		} );
	} );

	describe( '#fetchPost', () => {
		test( 'should call read/sites for blog posts', () => {
			readSiteStub.mockReturnValue( Promise.resolve( {} ) );
			const req = actions.fetchPost( { blogId: 1, postId: 2 } )( dispatchSpy );

			expect( readSiteStub ).toHaveBeenCalledWith( {
				site: 1,
				postId: 2,
			} );

			return req.then( () => {
				expect( dispatchSpy ).toHaveBeenCalledWith( expect.any( Function ) );
			} );
		} );

		test( 'should call read/feeds for feed posts', () => {
			readFeedStub.mockReturnValue( Promise.resolve( {} ) );
			const req = actions.fetchPost( { feedId: 1, postId: 2 } )( dispatchSpy );

			expect( readFeedStub ).toHaveBeenCalledWith( {
				feedId: 1,
				postId: 2,
			} );

			return req.then( () => {
				expect( dispatchSpy ).toHaveBeenCalledWith( expect.any( Function ) );
			} );
		} );

		test( 'should dispatch an error when a blog post call fails', () => {
			readSiteStub.mockReturnValue( Promise.reject( { status: 'oh no' } ) );
			const req = actions.fetchPost( { blogId: 1, postId: 2 } )( dispatchSpy );

			expect( readSiteStub ).toHaveBeenCalledWith( {
				site: 1,
				postId: 2,
			} );

			return req.then( () => {
				expect( dispatchSpy ).toHaveBeenCalledWith( {
					type: READER_POSTS_RECEIVE,
					posts: [
						{
							ID: 2,
							site_ID: 1,
							is_external: false,
							is_error: true,
							error: { status: 'oh no' },
							feed_ID: undefined,
							global_ID: expect.any( String ),
						},
					],
				} );
			} );
		} );

		test( 'should dispatch an error when a feed post call fails', () => {
			readFeedStub.mockReturnValue( Promise.reject( { status: 'oh no' } ) );
			const req = actions.fetchPost( { feedId: 1, postId: 2 } )( dispatchSpy );

			expect( readFeedStub ).toHaveBeenCalledWith( {
				feedId: 1,
				postId: 2,
			} );

			return req.then( () => {
				expect( dispatchSpy ).toHaveBeenCalledWith( {
					type: READER_POSTS_RECEIVE,
					posts: [
						{
							ID: 2,
							site_ID: undefined,
							is_external: true,
							is_error: true,
							error: { status: 'oh no' },
							feed_ID: 1,
							global_ID: expect.any( String ),
						},
					],
				} );
			} );
		} );
	} );
	describe( '#markPostSeen()', () => {
		const see = actions.markPostSeen;
		const dispatch = jest.fn();
		const getState = jest.fn();

		beforeEach( () => {
			dispatch.mockReset();
			getState.mockReset();
			pageViewForPost.mockReset();
			mc.bumpStat.mockReset();
		} );

		test( 'should not dispatch if post is falsey', () => {
			const post = null;
			see( post )( dispatch );

			expect( dispatch.mock.calls.length ).toBe( 0 );
		} );

		test( 'should not dispatch if post has already been seen', () => {
			const post = { global_ID: 1 };
			const state = { reader: { posts: { seen: { 1: true } } } };
			see( post )( dispatch, () => state );

			expect( dispatch.mock.calls.length ).toBe( 0 );
		} );

		test( 'should dispatch POST_SEEN and send pageviews for unseen posts with sites', () => {
			const post = { global_ID: 1, site_ID: 1 };
			const site = { ID: 1 };
			const state = { reader: { posts: { seen: {} } } };
			see( post, site )( dispatch, () => state );

			expect( dispatch ).toHaveBeenCalledWith( {
				type: READER_POST_SEEN,
				payload: { post, site },
			} );

			expect( pageViewForPost.mock.calls.length ).toBe( 1 );
			expect( mc.bumpStat.mock.calls.length ).toBe( 1 );
		} );
	} );
} );
