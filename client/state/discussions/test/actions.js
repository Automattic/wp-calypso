/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import useNock from 'test/helpers/use-nock';
import { useSandbox } from 'test/helpers/use-sinon';
import {
	DISCUSSIONS_COUNTS_UPDATE,
	DISCUSSIONS_ITEM_EDIT_CONTENT_REQUEST,
	DISCUSSIONS_ITEM_EDIT_CONTENT_REQUEST_FAILURE,
	DISCUSSIONS_ITEM_EDIT_CONTENT_REQUEST_SUCCESS,
	DISCUSSIONS_ITEM_LIKE_REQUEST,
	DISCUSSIONS_ITEM_LIKE_REQUEST_FAILURE,
	DISCUSSIONS_ITEM_LIKE_REQUEST_SUCCESS,
	DISCUSSIONS_ITEM_REMOVE,
	DISCUSSIONS_ITEM_STATUS_UPDATE_REQUEST,
	DISCUSSIONS_ITEM_STATUS_UPDATE_REQUEST_FAILURE,
	DISCUSSIONS_ITEM_STATUS_UPDATE_REQUEST_SUCCESS,
	DISCUSSIONS_ITEM_UNLIKE_REQUEST,
	DISCUSSIONS_ITEM_UNLIKE_REQUEST_FAILURE,
	DISCUSSIONS_ITEM_UNLIKE_REQUEST_SUCCESS,
	DISCUSSIONS_REQUEST,
	DISCUSSIONS_REQUEST_FAILURE,
	DISCUSSIONS_REQUEST_SUCCESS,
} from 'state/action-types';
import {
	requestPostComments,
	likePostComment,
	unlikePostComment,
	changeCommentStatus,
	editPostComment,
	removePostComment,
} from '../actions';

const PUBLIC_API = 'https://public-api.wordpress.com:443';
const SITE_ID = 91750058;
const POST_ID = 287;
const COMMENT_ID = 1;

describe( 'actions', () => {
	let sandbox, spy;

	useSandbox( newSandbox => {
		sandbox = newSandbox;
		spy = sandbox.spy();
	} );

	describe( '#requestPostComments()', () => {
		useNock( nock => {
			nock( PUBLIC_API )
				.persist()
				.get( `/rest/v1.1/sites/${ SITE_ID }/posts/${ POST_ID }/replies/` )
				.query( { status: 'all' } )
				.reply( 200, { comments: [], found: 4 } )
				.get( `/rest/v1.1/sites/${ SITE_ID }/posts/${ POST_ID }/replies/` )
				.query( { status: 'foo' } )
				.reply( 403, { error: 'foo', message: 'foo' } );
		} );

		const payload = {
			siteId: SITE_ID,
			postId: POST_ID,
			status: 'all'
		};

		it( 'should dispatch fetch action', () => {
			requestPostComments( SITE_ID, POST_ID )( spy );
			expect( spy ).to.have.been.calledWithMatch( {
				type: DISCUSSIONS_REQUEST,
				...payload
			} );
		} );

		it( 'should dispatch success action when request completes', () => {
			return requestPostComments( SITE_ID, POST_ID )( spy )
				.then( () => {
					expect( spy ).to.have.been.calledWith( {
						type: DISCUSSIONS_REQUEST_SUCCESS,
						...payload,
						comments: []
					} );
				} );
		} );

		it( 'should dispatch count update action when request completes', () => {
			return requestPostComments( SITE_ID, POST_ID )( spy )
				.then( () => {
					expect( spy ).to.have.been.calledWith( {
						type: DISCUSSIONS_COUNTS_UPDATE,
						...payload,
						found: 4
					} );
				} );
		} );

		it( 'should dispatch fail action when request fails', () => {
			return requestPostComments( SITE_ID, POST_ID, 'foo' )( spy )
				.then( () => {
					expect( spy ).to.have.been.calledWith( {
						type: DISCUSSIONS_REQUEST_FAILURE,
						...payload,
						status: 'foo',
						error: sandbox.match( { message: 'foo' } )
					} );
				} );
		} );
	} );

	describe( '#likePostComment()', () => {
		useNock( nock => {
			nock( PUBLIC_API )
				.persist()
				.post( `/rest/v1.1/sites/${ SITE_ID }/comments/${ COMMENT_ID }/likes/new`, { source: 'reader' } )
				.reply( 200, {
					i_like: true,
					like_count: 5
				} )
				.post( `/rest/v1.1/sites/${ SITE_ID }/comments/${ COMMENT_ID }/likes/new`, { source: 'foo' } )
				.reply( 403, { error: 'foo', message: 'foo' } );
		} );

		const payload = {
			siteId: SITE_ID,
			postId: POST_ID,
			commentId: COMMENT_ID,
			source: 'reader'
		};

		it( 'should dispatch fetch action', () => {
			likePostComment( SITE_ID, POST_ID, COMMENT_ID )( spy );
			expect( spy ).to.have.been.calledWithMatch( {
				type: DISCUSSIONS_ITEM_LIKE_REQUEST,
				...payload
			} );
		} );

		it( 'should dispatch success action when request completes', () => {
			return likePostComment( SITE_ID, POST_ID, COMMENT_ID )( spy )
				.then( () => {
					expect( spy ).to.have.been.calledWith( {
						type: DISCUSSIONS_ITEM_LIKE_REQUEST_SUCCESS,
						...payload,
						iLike: true,
						likeCount: 5
					} );
				} );
		} );

		it( 'should dispatch fail action when request fails', () => {
			return likePostComment( SITE_ID, POST_ID, COMMENT_ID, 'foo' )( spy )
				.then( () => {
					expect( spy ).to.have.been.calledWith( {
						type: DISCUSSIONS_ITEM_LIKE_REQUEST_FAILURE,
						...payload,
						source: 'foo',
						error: sandbox.match( { message: 'foo' } )
					} );
				} );
		} );
	} );

	describe( '#unlikePostComment()', () => {
		useNock( nock => {
			nock( PUBLIC_API )
				.persist()
				.post( `/rest/v1.1/sites/${ SITE_ID }/comments/${ COMMENT_ID }/likes/mine/delete` )
				.query( { source: 'reader' } )
				.reply( 200, {
					success: true,
					i_like: false,
					like_count: 5
				} )
				.post( `/rest/v1.1/sites/${ SITE_ID }/comments/${ COMMENT_ID }/likes/mine/delete` )
				.query( { source: 'foo' } )
				.reply( 403, { error: 'foo', message: 'foo' } );
		} );

		const payload = {
			siteId: SITE_ID,
			postId: POST_ID,
			commentId: COMMENT_ID,
			source: 'reader'
		};

		it( 'should dispatch fetch action', () => {
			unlikePostComment( SITE_ID, POST_ID, COMMENT_ID )( spy );
			expect( spy ).to.have.been.calledWithMatch( {
				type: DISCUSSIONS_ITEM_UNLIKE_REQUEST,
				...payload
			} );
		} );

		it( 'should dispatch success action when request completes', () => {
			return unlikePostComment( SITE_ID, POST_ID, COMMENT_ID )( spy )
				.then( () => {
					expect( spy ).to.have.been.calledWith( {
						type: DISCUSSIONS_ITEM_UNLIKE_REQUEST_SUCCESS,
						...payload,
						iLike: false,
						likeCount: 5
					} );
				} );
		} );

		it( 'should dispatch fail action when request fails', () => {
			return unlikePostComment( SITE_ID, POST_ID, COMMENT_ID, 'foo' )( spy )
				.then( () => {
					expect( spy ).to.have.been.calledWith( {
						type: DISCUSSIONS_ITEM_UNLIKE_REQUEST_FAILURE,
						...payload,
						source: 'foo',
						error: sandbox.match( { message: 'foo' } )
					} );
				} );
		} );
	} );

	describe( '#changeCommentStatus()', () => {
		useNock( nock => {
			nock( PUBLIC_API )
				.persist()
				.post( `/rest/v1.1/sites/${ SITE_ID }/comments/${ COMMENT_ID }`, { status: 'approved' } )
				.reply( 200, { status: 'approved' } )
				.post( `/rest/v1.1/sites/${ SITE_ID }/comments/${ COMMENT_ID }`, { status: 'all' } )
				.reply( 403, { error: 'foo', message: 'foo' } );
		} );

		const payload = {
			siteId: SITE_ID,
			postId: POST_ID,
			commentId: COMMENT_ID,
			status: 'approved'
		};

		it( 'should dispatch fetch action', () => {
			changeCommentStatus( SITE_ID, POST_ID, COMMENT_ID, 'approved' )( spy );
			expect( spy ).to.have.been.calledWithMatch( {
				type: DISCUSSIONS_ITEM_STATUS_UPDATE_REQUEST,
				...payload
			} );
		} );

		it( 'should dispatch success action when request completes', () => {
			return changeCommentStatus( SITE_ID, POST_ID, COMMENT_ID, 'approved' )( spy )
				.then( () => {
					expect( spy ).to.have.been.calledWith( {
						type: DISCUSSIONS_ITEM_STATUS_UPDATE_REQUEST_SUCCESS,
						...payload
					} );
				} );
		} );

		it( 'should dispatch fail action when request fails', () => {
			return changeCommentStatus( SITE_ID, POST_ID, COMMENT_ID, 'all' )( spy )
				.then( () => {
					expect( spy ).to.have.been.calledWith( {
						type: DISCUSSIONS_ITEM_STATUS_UPDATE_REQUEST_FAILURE,
						...payload,
						status: 'all',
						error: sandbox.match( { message: 'foo' } )
					} );
				} );
		} );
	} );

	describe( '#editPostComment()', () => {
		useNock( nock => {
			nock( PUBLIC_API )
				.persist()
				.post( `/rest/v1.1/sites/${ SITE_ID }/comments/${ COMMENT_ID }`, { content: 'lorem ipsum' } )
				.reply( 200, { content: 'lorem ipsum' } )
				.post( `/rest/v1.1/sites/${ SITE_ID }/comments/${ COMMENT_ID }`, { content: '' } )
				.reply( 403, { error: 'foo', message: 'foo' } );
		} );

		const payload = {
			siteId: SITE_ID,
			postId: POST_ID,
			commentId: COMMENT_ID,
			content: 'lorem ipsum'
		};

		it( 'should dispatch fetch action', () => {
			editPostComment( SITE_ID, POST_ID, COMMENT_ID, 'lorem ipsum' )( spy );
			expect( spy ).to.have.been.calledWithMatch( {
				type: DISCUSSIONS_ITEM_EDIT_CONTENT_REQUEST,
				...payload
			} );
		} );

		it( 'should dispatch success action when request completes', () => {
			return editPostComment( SITE_ID, POST_ID, COMMENT_ID, 'lorem ipsum' )( spy )
				.then( () => {
					expect( spy ).to.have.been.calledWith( {
						type: DISCUSSIONS_ITEM_EDIT_CONTENT_REQUEST_SUCCESS,
						...payload
					} );
				} );
		} );

		it( 'should dispatch fail action when request fails', () => {
			return editPostComment( SITE_ID, POST_ID, COMMENT_ID, '' )( spy )
				.then( () => {
					expect( spy ).to.have.been.calledWith( {
						type: DISCUSSIONS_ITEM_EDIT_CONTENT_REQUEST_FAILURE,
						...payload,
						content: '',
						error: sandbox.match( { message: 'foo' } )
					} );
				} );
		} );
	} );

	describe( '#removePostComment()', () => {
		it( 'should return a remove item action', () => {
			const action = removePostComment( SITE_ID, POST_ID, COMMENT_ID );
			expect( action ).to.eql( {
				type: DISCUSSIONS_ITEM_REMOVE,
				siteId: SITE_ID,
				postId: POST_ID,
				commentId: COMMENT_ID
			} );
		} );
	} );
} );
