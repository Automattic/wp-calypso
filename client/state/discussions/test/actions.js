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
	DISCUSSIONS_ITEM_LIKE_REQUEST,
	DISCUSSIONS_ITEM_LIKE_REQUEST_FAILURE,
	DISCUSSIONS_ITEM_LIKE_REQUEST_SUCCESS,
	DISCUSSIONS_REQUEST,
	DISCUSSIONS_REQUEST_FAILURE,
	DISCUSSIONS_REQUEST_SUCCESS
} from 'state/action-types';
import {
	requestPostComments,
	likePostComment,
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
				.reply( 403, {
					error: 'foo',
					message: 'foo'
				} );
		} );

		it( 'should dispatch fetch action', () => {
			requestPostComments( SITE_ID, POST_ID )( spy );
			expect( spy ).to.have.been.calledWithMatch( {
				type: DISCUSSIONS_REQUEST,
				siteId: SITE_ID,
				postId: POST_ID,
				status: 'all'
			} );
		} );

		it( 'should dispatch success action when request completes', () => {
			return requestPostComments( SITE_ID, POST_ID )( spy )
				.then( () => {
					expect( spy ).to.have.been.calledWith( {
						type: DISCUSSIONS_REQUEST_SUCCESS,
						siteId: SITE_ID,
						postId: POST_ID,
						comments: []
					} );
				} );
		} );

		it( 'should dispatch count update action when request completes', () => {
			return requestPostComments( SITE_ID, POST_ID )( spy )
				.then( () => {
					expect( spy ).to.have.been.calledWith( {
						type: DISCUSSIONS_COUNTS_UPDATE,
						siteId: SITE_ID,
						postId: POST_ID,
						found: 4
					} );
				} );
		} );

		it( 'should dispatch fail action when request fails', () => {
			return requestPostComments( SITE_ID, POST_ID, 'foo' )( spy )
				.then( () => {
					expect( spy ).to.have.been.calledWith( {
						type: DISCUSSIONS_REQUEST_FAILURE,
						siteId: SITE_ID,
						postId: POST_ID,
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
				.post( `/rest/v1.1/sites/${ SITE_ID }/comments/${ COMMENT_ID }/likes/new`, {
					source: 'reader'
				} )
				.reply( 200, {
					i_like: true,
					like_count: 5
				} )
				.post( `/rest/v1.1/sites/${ SITE_ID }/comments/${ COMMENT_ID }/likes/new`, {
					source: 'foo'
				} )
				.reply( 403, { error: 'foo', message: 'foo' } );
		} );

		it( 'should dispatch fetch action', () => {
			likePostComment( SITE_ID, POST_ID, COMMENT_ID )( spy );
			expect( spy ).to.have.been.calledWithMatch( {
				type: DISCUSSIONS_ITEM_LIKE_REQUEST,
				siteId: SITE_ID,
				postId: POST_ID,
				commentId: COMMENT_ID
			} );
		} );

		it( 'should dispatch success action when request completes', () => {
			return likePostComment( SITE_ID, POST_ID, COMMENT_ID )( spy )
				.then( () => {
					expect( spy ).to.have.been.calledWith( {
						type: DISCUSSIONS_ITEM_LIKE_REQUEST_SUCCESS,
						siteId: SITE_ID,
						postId: POST_ID,
						commentId: COMMENT_ID,
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
						siteId: SITE_ID,
						postId: POST_ID,
						commentId: COMMENT_ID,
						error: sandbox.match( { message: 'foo' } )
					} );
				} );
		} );
	} );
} );
