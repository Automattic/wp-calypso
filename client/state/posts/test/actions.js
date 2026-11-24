import nock from 'nock';
import { vi } from 'vitest';
import {
	POST_REQUEST,
	POST_REQUEST_SUCCESS,
	POST_REQUEST_FAILURE,
	POST_RESTORE,
	POST_RESTORE_FAILURE,
	POST_SAVE_SUCCESS,
	POSTS_RECEIVE,
	POSTS_REQUEST,
	POSTS_REQUEST_SUCCESS,
	POSTS_REQUEST_FAILURE,
} from 'calypso/state/action-types';
import {
	requestSitePosts,
	requestSitePost,
	requestAllSitesPosts,
	restorePost,
} from 'calypso/state/posts/actions';
import { receivePost } from 'calypso/state/posts/actions/receive-post';
import { receivePosts } from 'calypso/state/posts/actions/receive-posts';

describe( 'actions', () => {
	let dispatch;
	let getState;

	beforeEach( () => {
		dispatch = vi.fn();
		getState = vi.fn( () => ( {
			posts: {
				queries: {},
			},
		} ) );
	} );

	describe( '#receivePost()', () => {
		test( 'should return an action object', () => {
			const post = { ID: 841, title: 'Hello World' };
			const action = receivePost( post );

			expect( action ).toEqual( {
				type: POSTS_RECEIVE,
				posts: [ post ],
			} );
		} );
	} );

	describe( '#receivePosts()', () => {
		test( 'should return an action object', () => {
			const posts = [ { ID: 841, title: 'Hello World' } ];
			const action = receivePosts( posts );

			expect( action ).toEqual( {
				type: POSTS_RECEIVE,
				posts,
			} );
		} );
	} );

	describe( 'savePostSuccess()', () => {
		// eslint-disable-next-line no-shadow
		const { savePostSuccess } = jest.requireActual(
			'calypso/state/posts/actions/save-post-success'
		);
		test( 'should return an action object', () => {
			const savedPost = { ID: 841, title: 'Hello World' };
			const attributes = { status: 'draft' };
			savePostSuccess( 10, 841, savedPost, attributes )( dispatch );

			expect( dispatch ).toHaveBeenCalledWith( {
				type: POST_SAVE_SUCCESS,
				siteId: 10,
				postId: 841,
				savedPost: savedPost,
				post: attributes,
			} );
		} );
	} );

	describe( '#requestSitePosts()', () => {
		beforeAll( () => {
			nock( 'https://public-api.wordpress.com:443' )
				.persist()
				.get( '/rest/v1.1/sites/2916284/posts' )
				.reply( 200, {
					found: 2,
					posts: [
						{ ID: 841, title: 'Hello World' },
						{ ID: 413, title: 'Ribs & Chicken' },
					],
				} )
				.get( '/rest/v1.1/sites/2916284/posts' )
				.query( { search: 'Hello' } )
				.reply( 200, {
					found: 1,
					posts: [ { ID: 841, title: 'Hello World' } ],
				} )
				.get( '/rest/v1.1/sites/77203074/posts' )
				.reply( 403, {
					error: 'authorization_required',
					message: 'User cannot access this private blog.',
				} );
		} );

		test( 'should dispatch fetch action when thunk triggered', () => {
			requestSitePosts( 2916284 )( dispatch );

			expect( dispatch ).toHaveBeenCalledWith( {
				type: POSTS_REQUEST,
				siteId: 2916284,
				query: {},
			} );
		} );

		test( 'should dispatch posts receive action when request completes', () => {
			return requestSitePosts( 2916284 )( dispatch ).then( () => {
				expect( dispatch ).toHaveBeenCalledWith( {
					type: POSTS_RECEIVE,
					posts: [
						{ ID: 841, title: 'Hello World' },
						{ ID: 413, title: 'Ribs & Chicken' },
					],
				} );
			} );
		} );

		test( 'should dispatch success action when posts request completes', () => {
			return requestSitePosts( 2916284 )( dispatch ).then( () => {
				expect( dispatch ).toHaveBeenCalledWith( {
					type: POSTS_REQUEST_SUCCESS,
					siteId: 2916284,
					query: {},
					found: 2,
					posts: [
						{ ID: 841, title: 'Hello World' },
						{ ID: 413, title: 'Ribs & Chicken' },
					],
				} );
			} );
		} );

		test( 'should dispatch posts request success action with query results', () => {
			return requestSitePosts( 2916284, { search: 'Hello' } )( dispatch ).then( () => {
				expect( dispatch ).toHaveBeenCalledWith( {
					type: POSTS_REQUEST_SUCCESS,
					siteId: 2916284,
					query: { search: 'Hello' },
					found: 1,
					posts: [ { ID: 841, title: 'Hello World' } ],
				} );
			} );
		} );

		test( 'should dispatch failure action when request fails', () => {
			return requestSitePosts( 77203074 )( dispatch ).then( () => {
				expect( dispatch ).toHaveBeenCalledWith(
					expect.objectContaining( {
						type: POSTS_REQUEST_FAILURE,
						siteId: 77203074,
						query: {},
						error: expect.objectContaining( { message: 'User cannot access this private blog.' } ),
					} )
				);
			} );
		} );
	} );

	describe( '#requestAllSitesPosts()', () => {
		beforeAll( () => {
			nock( 'https://public-api.wordpress.com:443' )
				.persist()
				.get( '/rest/v1.1/me/posts' )
				.reply( 200, {
					found: 2,
					posts: [
						{ ID: 841, title: 'Hello World' },
						{ ID: 413, title: 'Ribs & Chicken' },
					],
				} );
		} );

		test( 'should dispatch posts receive action when request completes', () => {
			return requestAllSitesPosts()( dispatch ).then( () => {
				expect( dispatch ).toHaveBeenCalledWith( {
					type: POSTS_RECEIVE,
					posts: [
						{ ID: 841, title: 'Hello World' },
						{ ID: 413, title: 'Ribs & Chicken' },
					],
				} );
			} );
		} );
	} );

	describe( '#requestSitePost()', () => {
		beforeAll( () => {
			nock( 'https://public-api.wordpress.com:443' )
				.persist()
				.get( '/rest/v1.1/sites/2916284/posts/413' )
				.reply( 200, { ID: 413, title: 'Ribs & Chicken' } )
				.get( '/rest/v1.1/sites/2916284/posts/420' )
				.reply( 404, {
					error: 'unknown_post',
					message: 'Unknown post',
				} );
		} );

		test( 'should dispatch request action when thunk triggered', () => {
			requestSitePost( 2916284, 413 )( dispatch );

			expect( dispatch ).toHaveBeenCalledWith( {
				type: POST_REQUEST,
				siteId: 2916284,
				postId: 413,
			} );
		} );

		test( 'should dispatch posts receive action when request completes', () => {
			return requestSitePost(
				2916284,
				413
			)( dispatch ).then( () => {
				expect( dispatch ).toHaveBeenCalledWith( {
					type: POSTS_RECEIVE,
					posts: [ expect.objectContaining( { ID: 413, title: 'Ribs & Chicken' } ) ],
				} );
			} );
		} );

		test( 'should dispatch posts posts request success action when request completes', () => {
			return requestSitePost(
				2916284,
				413
			)( dispatch ).then( () => {
				expect( dispatch ).toHaveBeenCalledWith( {
					type: POST_REQUEST_SUCCESS,
					siteId: 2916284,
					postId: 413,
				} );
			} );
		} );

		test( 'should dispatch fail action when request fails', () => {
			return requestSitePost(
				2916284,
				420
			)( dispatch ).then( () => {
				expect( dispatch ).toHaveBeenCalledWith( {
					type: POST_REQUEST_FAILURE,
					siteId: 2916284,
					postId: 420,
					error: expect.objectContaining( { message: 'Unknown post' } ),
				} );
			} );
		} );
	} );

	describe( 'restorePost()', () => {
		beforeAll( () => {
			nock( 'https://public-api.wordpress.com:443' )
				.persist()
				.post( '/rest/v1.1/sites/2916284/posts/13640/restore' )
				.reply( 200, {
					ID: 13640,
					status: 'draft',
				} )
				.post( '/rest/v1.1/sites/77203074/posts/102/restore' )
				.reply( 403, {
					error: 'unauthorized',
					message: 'User cannot restore trashed posts',
				} );
		} );

		test( 'should dispatch request action when thunk triggered', () => {
			restorePost( 2916284, 13640 )( dispatch, getState );

			expect( dispatch ).toHaveBeenCalledWith( {
				type: POST_RESTORE,
				siteId: 2916284,
				postId: 13640,
			} );
		} );

		test( 'should dispatch the received post when request completes successfully', () => {
			return restorePost( 2916284, 13640 )( dispatch, getState ).then( () => {
				expect( dispatch ).toHaveBeenCalledWith( {
					type: POSTS_RECEIVE,
					posts: [ { ID: 13640, status: 'draft' } ],
				} );
			} );
		} );

		test( 'should dispatch failure action when restoring post fails', async () => {
			await expect( restorePost( 77203074, 102 )( dispatch, getState ) ).rejects.toThrow();

			expect( dispatch ).toHaveBeenCalledWith( {
				type: POST_RESTORE_FAILURE,
				siteId: 77203074,
				postId: 102,
				error: expect.objectContaining( { message: 'User cannot restore trashed posts' } ),
			} );
		} );
	} );
} );
