/**
 * External dependencies
 */
import sinon from 'sinon';
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import PostQueryManager from 'lib/query-manager/post';
import {
	POST_DELETE,
	POST_DELETE_SUCCESS,
	POST_DELETE_FAILURE,
	POST_EDIT,
	POST_REQUEST,
	POST_REQUEST_SUCCESS,
	POST_REQUEST_FAILURE,
	POST_RESTORE,
	POST_RESTORE_FAILURE,
	POST_RESTORE_SUCCESS,
	POST_SAVE,
	POST_SAVE_SUCCESS,
	POST_SAVE_FAILURE,
	POSTS_RECEIVE,
	POSTS_REQUEST,
	POSTS_REQUEST_SUCCESS,
	POSTS_REQUEST_FAILURE
} from 'state/action-types';
import {
	receivePost,
	receivePosts,
	requestSitePosts,
	requestSitePost,
	requestPosts,
	editPost,
	savePost,
	savePostSuccess,
	trashPost,
	deletePost,
	restorePost,
	addTermForPost
} from '../actions';
import useNock from 'test/helpers/use-nock';

describe( 'actions', () => {
	const spy = sinon.spy();

	beforeEach( () => {
		spy.reset();
	} );

	describe( '#receivePost()', () => {
		it( 'should return an action object', () => {
			const post = { ID: 841, title: 'Hello World' };
			const action = receivePost( post );

			expect( action ).to.eql( {
				type: POSTS_RECEIVE,
				posts: [ post ]
			} );
		} );
	} );

	describe( '#receivePosts()', () => {
		it( 'should return an action object', () => {
			const posts = [ { ID: 841, title: 'Hello World' } ];
			const action = receivePosts( posts );

			expect( action ).to.eql( {
				type: POSTS_RECEIVE,
				posts
			} );
		} );
	} );

	describe( 'savePostSuccess()', () => {
		it( 'should return an action object', () => {
			const savedPost = { ID: 841, title: 'Hello World' };
			const attributes = { status: 'draft' };
			const action = savePostSuccess( 10, 841, savedPost, attributes );

			expect( action ).to.eql( {
				type: POST_SAVE_SUCCESS,
				siteId: 10,
				postId: 841,
				savedPost: savedPost,
				post: attributes,
			} );
		} );
	} );

	describe( '#requestSitePosts()', () => {
		useNock( ( nock ) => {
			nock( 'https://public-api.wordpress.com:443' )
				.persist()
				.get( '/rest/v1.1/sites/2916284/posts' )
				.reply( 200, {
					found: 2,
					posts: [
						{ ID: 841, title: 'Hello World' },
						{ ID: 413, title: 'Ribs & Chicken' }
					]
				} )
				.get( '/rest/v1.1/sites/2916284/posts' )
				.query( { search: 'Hello' } )
				.reply( 200, {
					found: 1,
					posts: [ { ID: 841, title: 'Hello World' } ]
				} )
				.get( '/rest/v1.1/sites/77203074/posts' )
				.reply( 403, {
					error: 'authorization_required',
					message: 'User cannot access this private blog.'
				} );
		} );

		it( 'should dispatch fetch action when thunk triggered', () => {
			requestSitePosts( 2916284 )( spy );

			expect( spy ).to.have.been.calledWith( {
				type: POSTS_REQUEST,
				siteId: 2916284,
				query: {}
			} );
		} );

		it( 'should dispatch posts receive action when request completes', () => {
			return requestSitePosts( 2916284 )( spy ).then( () => {
				expect( spy ).to.have.been.calledWith( {
					type: POSTS_RECEIVE,
					posts: [
						{ ID: 841, title: 'Hello World' },
						{ ID: 413, title: 'Ribs & Chicken' }
					]
				} );
			} );
		} );

		it( 'should dispatch posts posts request success action when request completes', () => {
			return requestSitePosts( 2916284 )( spy ).then( () => {
				expect( spy ).to.have.been.calledWith( {
					type: POSTS_REQUEST_SUCCESS,
					siteId: 2916284,
					query: {},
					found: 2,
					posts: [
						{ ID: 841, title: 'Hello World' },
						{ ID: 413, title: 'Ribs & Chicken' }
					]
				} );
			} );
		} );

		it( 'should dispatch posts request success action with query results', () => {
			return requestSitePosts( 2916284, { search: 'Hello' } )( spy ).then( () => {
				expect( spy ).to.have.been.calledWith( {
					type: POSTS_REQUEST_SUCCESS,
					siteId: 2916284,
					query: { search: 'Hello' },
					found: 1,
					posts: [
						{ ID: 841, title: 'Hello World' }
					]
				} );
			} );
		} );

		it( 'should dispatch fail action when request fails', () => {
			return requestSitePosts( 77203074 )( spy ).then( () => {
				expect( spy ).to.have.been.calledWith( {
					type: POSTS_REQUEST_FAILURE,
					siteId: 77203074,
					query: {},
					error: sinon.match( { message: 'User cannot access this private blog.' } )
				} );
			} );
		} );
	} );

	describe( '#requestPosts()', () => {
		useNock( ( nock ) => {
			nock( 'https://public-api.wordpress.com:443' )
				.persist()
				.get( '/rest/v1.1/me/posts' )
				.reply( 200, {
					found: 2,
					posts: [
						{ ID: 841, title: 'Hello World' },
						{ ID: 413, title: 'Ribs & Chicken' }
					]
				} );
		} );

		it( 'should dispatch posts receive action when request completes', () => {
			return requestPosts()( spy ).then( () => {
				expect( spy ).to.have.been.calledWith( {
					type: POSTS_RECEIVE,
					posts: [
						{ ID: 841, title: 'Hello World' },
						{ ID: 413, title: 'Ribs & Chicken' }
					]
				} );
			} );
		} );
	} );

	describe( '#requestSitePost()', () => {
		useNock( ( nock ) => {
			nock( 'https://public-api.wordpress.com:443' )
				.persist()
				.get( '/rest/v1.1/sites/2916284/posts/413' )
				.reply( 200, { ID: 413, title: 'Ribs & Chicken' } )
				.get( '/rest/v1.1/sites/2916284/posts/420' )
				.reply( 404, {
					error: 'unknown_post',
					message: 'Unknown post'
				} );
		} );

		it( 'should dispatch request action when thunk triggered', () => {
			requestSitePost( 2916284, 413 )( spy );

			expect( spy ).to.have.been.calledWith( {
				type: POST_REQUEST,
				siteId: 2916284,
				postId: 413
			} );
		} );

		it( 'should dispatch posts receive action when request completes', () => {
			return requestSitePost( 2916284, 413 )( spy ).then( () => {
				expect( spy ).to.have.been.calledWith( {
					type: POSTS_RECEIVE,
					posts: [
						sinon.match( { ID: 413, title: 'Ribs & Chicken' } )
					]
				} );
			} );
		} );

		it( 'should dispatch posts posts request success action when request completes', () => {
			return requestSitePost( 2916284, 413 )( spy ).then( () => {
				expect( spy ).to.have.been.calledWith( {
					type: POST_REQUEST_SUCCESS,
					siteId: 2916284,
					postId: 413
				} );
			} );
		} );

		it( 'should dispatch fail action when request fails', () => {
			return requestSitePost( 2916284, 420 )( spy ).then( () => {
				expect( spy ).to.have.been.calledWith( {
					type: POST_REQUEST_FAILURE,
					siteId: 2916284,
					postId: 420,
					error: sinon.match( { message: 'Unknown post' } )
				} );
			} );
		} );
	} );

	describe( '#editPost()', () => {
		it( 'should return an action object for a new post', () => {
			const action = editPost( 2916284, null, {
				title: 'Hello World'
			}, 2916284 );

			expect( action ).to.eql( {
				type: POST_EDIT,
				siteId: 2916284,
				postId: null,
				post: { title: 'Hello World' }
			} );
		} );

		it( 'should return an action object for an existing post', () => {
			const action = editPost( 2916284, 413, {
				title: 'Hello World'
			} );

			expect( action ).to.eql( {
				type: POST_EDIT,
				siteId: 2916284,
				postId: 413,
				post: { title: 'Hello World' }
			} );
		} );
	} );

	describe( 'savePost()', () => {
		useNock( ( nock ) => {
			nock( 'https://public-api.wordpress.com:443' )
				.persist()
				.post( '/rest/v1.2/sites/2916284/posts/new', {
					title: 'Hello World'
				} )
				.reply( 200, {
					ID: 13640,
					title: 'Hello World'
				} )
				.post( '/rest/v1.2/sites/2916284/posts/13640', {
					title: 'Updated'
				} )
				.reply( 200, {
					ID: 13640,
					title: 'Updated'
				} )
				.post( '/rest/v1.2/sites/77203074/posts/new' )
				.reply( 403, {
					error: 'unauthorized',
					message: 'User cannot edit posts'
				} )
				.post( '/rest/v1.2/sites/77203074/posts/102' )
				.reply( 403, {
					error: 'unauthorized',
					message: 'User cannot edit post'
				} );
		} );

		it( 'should dispatch save action when thunk triggered for new post', () => {
			savePost( 2916284, null, { title: 'Hello World' } )( spy );

			expect( spy ).to.have.been.calledWith( {
				type: POST_SAVE,
				siteId: 2916284,
				postId: null,
				post: {
					title: 'Hello World'
				}
			} );
		} );

		it( 'should dispatch post save save success action when request completes for new post', () => {
			return savePost( 2916284, null, { title: 'Hello World' } )( spy ).then( () => {
				expect( spy ).to.have.been.calledWith( {
					type: POST_SAVE_SUCCESS,
					siteId: 2916284,
					postId: null,
					post: { title: 'Hello World' },
					savedPost: sinon.match( {
						ID: 13640,
						title: 'Hello World'
					} )
				} );
			} );
		} );

		it( 'should dispatch received post action when request completes for new post', () => {
			return savePost( 2916284, null, { title: 'Hello World' } )( spy ).then( () => {
				expect( spy ).to.have.been.calledWith( {
					type: POSTS_RECEIVE,
					posts: [
						sinon.match( {
							ID: 13640,
							title: 'Hello World'
						} )
					]
				} );
			} );
		} );

		it( 'should dispatch save action when thunk triggered for existing post', () => {
			savePost( 2916284, 13640, { title: 'Updated' } )( spy );

			expect( spy ).to.have.been.calledWith( {
				type: POST_SAVE,
				siteId: 2916284,
				postId: 13640,
				post: {
					title: 'Updated'
				}
			} );
		} );

		it( 'should dispatch post save save success action when request completes for existing post', () => {
			return savePost( 2916284, 13640, { title: 'Updated' } )( spy ).then( () => {
				expect( spy ).to.have.been.calledWith( {
					type: POST_SAVE_SUCCESS,
					siteId: 2916284,
					postId: 13640,
					post: { title: 'Updated' },
					savedPost: sinon.match( {
						ID: 13640,
						title: 'Updated'
					} )
				} );
			} );
		} );

		it( 'should dispatch received post action when request completes for existing post', () => {
			return savePost( 2916284, 13640, { title: 'Updated' } )( spy ).then( () => {
				expect( spy ).to.have.been.calledWith( {
					type: POSTS_RECEIVE,
					posts: [
						sinon.match( {
							ID: 13640,
							title: 'Updated'
						} )
					]
				} );
			} );
		} );

		it( 'should dispatch failure action when error occurs while saving new post', () => {
			return savePost( 77203074, null, { title: 'Hello World' } )( spy ).then( () => {
				expect( spy ).to.have.been.calledWith( {
					type: POST_SAVE_FAILURE,
					siteId: 77203074,
					postId: null,
					error: sinon.match( { message: 'User cannot edit posts' } )
				} );
			} );
		} );

		it( 'should dispatch failure action when error occurs while saving existing post', () => {
			return savePost( 77203074, 102, { title: 'Hello World' } )( spy ).then( () => {
				expect( spy ).to.have.been.calledWith( {
					type: POST_SAVE_FAILURE,
					siteId: 77203074,
					postId: 102,
					error: sinon.match( { message: 'User cannot edit post' } )
				} );
			} );
		} );
	} );

	describe( 'trashPost()', () => {
		it( 'should dispatch save request with trash status payload', () => {
			trashPost( 2916284, 13640 )( spy );

			expect( spy ).to.have.been.calledWith( {
				type: POST_SAVE,
				siteId: 2916284,
				postId: 13640,
				post: {
					status: 'trash'
				}
			} );
		} );
	} );

	describe( 'deletePost()', () => {
		useNock( ( nock ) => {
			nock( 'https://public-api.wordpress.com:443' )
				.persist()
				.post( '/rest/v1.1/sites/2916284/posts/13640/delete' )
				.reply( 200, {
					ID: 13640,
					status: 'deleted'
				} )
				.post( '/rest/v1.1/sites/77203074/posts/102/delete' )
				.reply( 403, {
					error: 'unauthorized',
					message: 'User cannot delete posts'
				} );
		} );

		it( 'should dispatch request action when thunk triggered', () => {
			deletePost( 2916284, 13640 )( spy );

			expect( spy ).to.have.been.calledWith( {
				type: POST_DELETE,
				siteId: 2916284,
				postId: 13640
			} );
		} );

		it( 'should dispatch post delete request success action when request completes', () => {
			return deletePost( 2916284, 13640 )( spy ).then( () => {
				expect( spy ).to.have.been.calledWith( {
					type: POST_DELETE_SUCCESS,
					siteId: 2916284,
					postId: 13640
				} );
			} );
		} );

		it( 'should dispatch post delete request failure action when request fails', () => {
			return deletePost( 77203074, 102 )( spy ).then( () => {
				expect( spy ).to.have.been.calledWith( {
					type: POST_DELETE_FAILURE,
					siteId: 77203074,
					postId: 102,
					error: sinon.match( { message: 'User cannot delete posts' } )
				} );
			} );
		} );
	} );

	describe( 'restorePost()', () => {
		useNock( ( nock ) => {
			nock( 'https://public-api.wordpress.com:443' )
				.persist()
				.post( '/rest/v1.1/sites/2916284/posts/13640/restore' )
				.reply( 200, {
					ID: 13640,
					status: 'draft'
				} )
				.post( '/rest/v1.1/sites/77203074/posts/102/restore' )
				.reply( 403, {
					error: 'unauthorized',
					message: 'User cannot restore trashed posts'
				} );
		} );

		it( 'should dispatch request action when thunk triggered', () => {
			restorePost( 2916284, 13640 )( spy );

			expect( spy ).to.have.been.calledWith( {
				type: POST_RESTORE,
				siteId: 2916284,
				postId: 13640
			} );
		} );

		it( 'should dispatch the received post when request completes successfully', () => {
			return restorePost( 2916284, 13640 )( spy ).then( () => {
				expect( spy ).to.have.been.calledWith( {
					type: POSTS_RECEIVE,
					posts: [ { ID: 13640, status: 'draft' } ]
				} );
			} );
		} );

		it( 'should dispatch post restore request success action when request completes', () => {
			return restorePost( 2916284, 13640 )( spy ).then( () => {
				expect( spy ).to.have.been.calledWith( {
					type: POST_RESTORE_SUCCESS,
					siteId: 2916284,
					postId: 13640
				} );
			} );
		} );

		it( 'should dispatch post restore request failure action when request fails', () => {
			return restorePost( 77203074, 102 )( spy ).then( () => {
				expect( spy ).to.have.been.calledWith( {
					type: POST_RESTORE_FAILURE,
					siteId: 77203074,
					postId: 102,
					error: sinon.match( { message: 'User cannot restore trashed posts' } )
				} );
			} );
		} );
	} );

	describe( 'addTermForPost()', () => {
		const postObject = {
			ID: 841,
			site_ID: 2916284,
			global_ID: '3d097cb7c5473c169bba0eb8e3c6cb64',
			title: 'Hello World'
		};
		const getState = () => {
			return {
				posts: {
					items: {
						'3d097cb7c5473c169bba0eb8e3c6cb64': [ 2916284, 841 ]
					},
					queries: {
						2916284: new PostQueryManager( {
							items: { 841: postObject }
						} )
					},
					edits: {}
				}
			};
		};

		it( 'should dispatch a EDIT_POST event with the new term', () => {
			addTermForPost( 2916284, 'jetpack-portfolio', { ID: 123, name: 'ribs' }, 841 )( spy, getState );
			expect( spy ).to.have.been.calledWith( {
				post: {
					terms: {
						'jetpack-portfolio': [ {
							ID: 123,
							name: 'ribs'
						} ]
					}
				},
				postId: 841,
				siteId: 2916284,
				type: POST_EDIT
			} );
		} );

		it( 'should not dispatch anything if no post', () => {
			addTermForPost( 2916284, 'jetpack-portfolio', { ID: 123, name: 'ribs' }, 3434 )( spy, getState );
			expect( spy ).not.to.have.been.called;
		} );

		it( 'should not dispatch anything if no term', () => {
			addTermForPost( 2916284, 'jetpack-portfolio', null, 841 )( spy, getState );
			expect( spy ).not.to.have.been.called;
		} );

		it( 'should not dispatch anything if the term is temporary', () => {
			addTermForPost( 2916284, 'jetpack-portfolio', { id: 'temporary' }, 841 )( spy, getState );
			expect( spy ).not.to.have.been.called;
		} );
	} );
} );
