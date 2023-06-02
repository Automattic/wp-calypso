import { bumpStat } from 'calypso/lib/analytics/mc';
import * as tracks from 'calypso/lib/analytics/tracks';
import wp from 'calypso/lib/wp';
import { READER_POSTS_RECEIVE, READER_POST_SEEN } from 'calypso/state/reader/action-types';
import * as actions from '../actions';
const { pageViewForPost } = require( 'calypso/reader/stats' );

jest.mock( 'calypso/reader/stats', () => ( { pageViewForPost: jest.fn() } ) );

jest.mock( 'calypso/lib/analytics/tracks', () => ( {
	recordTracksEvent: jest.fn(),
} ) );

jest.mock( 'calypso/lib/analytics/mc', () => ( {
	bumpStat: jest.fn(),
} ) );

jest.mock( 'calypso/lib/wp', () => ( {
	req: {
		get: jest.fn(),
	},
} ) );

describe( 'actions', () => {
	const dispatchSpy = jest.fn();
	const trackingSpy = tracks.recordTracksEvent;
	const wpcomGetStub = wp.req.get;

	afterEach( () => {
		dispatchSpy.mockReset();
		trackingSpy.mockReset();
		wpcomGetStub.mockReset();
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
			wpcomGetStub.mockReturnValue( Promise.resolve( {} ) );
			const req = actions.fetchPost( { blogId: 1, postId: 2 } )( dispatchSpy );

			expect( wpcomGetStub ).toHaveBeenCalledWith( '/read/sites/1/posts/2', {} );

			return req.then( () => {
				expect( dispatchSpy ).toHaveBeenCalledWith( expect.any( Function ) );
			} );
		} );

		test( 'should call read/feeds for feed posts', () => {
			wpcomGetStub.mockReturnValue( Promise.resolve( {} ) );
			const req = actions.fetchPost( { feedId: 1, postId: 2 } )( dispatchSpy );

			expect( wpcomGetStub ).toHaveBeenCalledWith( '/read/feed/1/posts/2', { apiVersion: '1.2' } );

			return req.then( () => {
				expect( dispatchSpy ).toHaveBeenCalledWith( expect.any( Function ) );
			} );
		} );

		test( 'should dispatch an error when a blog post call fails', () => {
			wpcomGetStub.mockReturnValue( Promise.reject( { status: 'oh no' } ) );
			const req = actions.fetchPost( { blogId: 1, postId: 2 } )( dispatchSpy );

			expect( wpcomGetStub ).toHaveBeenCalledWith( '/read/sites/1/posts/2', {} );

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
			wpcomGetStub.mockReturnValue( Promise.reject( { status: 'oh no' } ) );
			const req = actions.fetchPost( { feedId: 1, postId: 2 } )( dispatchSpy );

			expect( wpcomGetStub ).toHaveBeenCalledWith( '/read/feed/1/posts/2', { apiVersion: '1.2' } );

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
			bumpStat.mockReset();
		} );

		test( 'should not dispatch if post is falsey', () => {
			const post = null;
			see( post )( dispatch );

			expect( dispatch.mock.calls ).toHaveLength( 0 );
		} );

		test( 'should not dispatch if post has already been seen', () => {
			const post = { global_ID: 1 };
			const state = { reader: { posts: { seen: { 1: true } } } };
			see( post )( dispatch, () => state );

			expect( dispatch.mock.calls ).toHaveLength( 0 );
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

			// expect( pageViewForPost.mock.calls.length ).toBe( 1 );
			expect( bumpStat.mock.calls.length ).toBe( 1 );
		} );
	} );
} );
