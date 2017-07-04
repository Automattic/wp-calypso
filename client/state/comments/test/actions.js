/**
 * External dependencies
 */
import nock from 'nock';
import sinon from 'sinon';
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import config from 'config';
import { useSandbox } from 'test/helpers/use-sinon';
import {
	COMMENTS_REMOVE,
	COMMENTS_REQUEST,
	COMMENTS_LIKE,
	COMMENTS_LIKE_UPDATE,
	COMMENTS_UNLIKE,
	COMMENTS_WRITE,
	COMMENTS_REPLY_WRITE,
} from '../../action-types';
import {
	requestPostComments,
	writeComment,
	replyComment,
	removeComment,
	likeComment,
	unlikeComment
} from '../actions';
import {
	NUMBER_OF_COMMENTS_PER_FETCH
} from '../constants';

const SITE_ID = 91750058;
const POST_ID = 287;
const API_DOMAIN = 'https://public-api.wordpress.com:443';

describe( 'actions', () => {
	after( () => {
		nock.cleanAll();
	} );

	describe( '#requestPostComments()', () => {
		useSandbox( ( sandbox ) => {
			sandbox.stub( config, 'isEnabled' ).withArgs( 'comments/filters-in-posts' ).returns( true );
		} );

		it( 'should return a comment request action', function() {
			const action = requestPostComments( SITE_ID, POST_ID, 'trash' );

			expect( action ).to.eql( {
				type: COMMENTS_REQUEST,
				siteId: SITE_ID,
				postId: POST_ID,
				query: {
					order: 'DESC',
					number: NUMBER_OF_COMMENTS_PER_FETCH,
					status: 'trash'
				}
			} );
		} );

		it( 'should return a comment request action with a default status of approved', function() {
			const action = requestPostComments( SITE_ID, POST_ID, undefined );

			expect( action ).to.eql( {
				type: COMMENTS_REQUEST,
				siteId: SITE_ID,
				postId: POST_ID,
				query: {
					order: 'DESC',
					number: NUMBER_OF_COMMENTS_PER_FETCH,
					status: 'approved'
				}
			} );
		} );
	} );

	describe( '#writeComment()', () => {
		it( 'should return a write comment action', function() {
			const action = writeComment( 'comment text', SITE_ID, POST_ID );

			expect( action ).to.eql( {
				type: COMMENTS_WRITE,
				siteId: SITE_ID,
				postId: POST_ID,
				commentText: 'comment text',
			} );
		} );
	} );

	describe( '#replyComment()', () => {
		it( 'should return a write comment action', function() {
			const action = replyComment( 'comment text', SITE_ID, POST_ID, 1 );

			expect( action ).to.eql( {
				type: COMMENTS_REPLY_WRITE,
				siteId: SITE_ID,
				postId: POST_ID,
				parentCommentId: 1,
				commentText: 'comment text',
			} );
		} );
	} );

	describe( '#removeComment()', () => {
		it( 'should dispatch remove for a placeholder when provided', () => {
			const removeCommentAction = removeComment( SITE_ID, POST_ID, 'placeholder-123' );

			expect( removeCommentAction.type ).to.eql( COMMENTS_REMOVE );
			expect( removeCommentAction.commentId ).to.equal( 'placeholder-123' );
		} );
	} );

	describe( '#likeComment()', () => {
		it( 'should return a like comment action', () => {
			const action = likeComment( SITE_ID, POST_ID, 1 );

			expect( action ).to.eql( {
				type: COMMENTS_LIKE,
				siteId: SITE_ID,
				postId: POST_ID,
				commentId: 1
			} );
		} );
	} );

	describe( '#unlikeComment()', () => {
		it( 'should dispatch correct actions when request fails', () => {
			const unlikeThunk = unlikeComment( 1, 1, 1 );
			const dispatchSpy = sinon.spy();

			const apiPromise = unlikeThunk( dispatchSpy );

			expect( dispatchSpy ).to.be.calledWith( {
				type: COMMENTS_UNLIKE,
				siteId: 1,
				postId: 1,
				commentId: 1
			} );

			// since we didn't mock the request and we have disabled requests
			// we expect this to fail an revert the optimistic update
			return apiPromise.then( () => {
				expect( dispatchSpy ).to.be.calledWith( {
					type: COMMENTS_LIKE,
					siteId: 1,
					postId: 1,
					commentId: 1
				} );
			} );
		} );

		it( 'should dispatch correct action when request succeed', () => {
			const dispatchSpy = sinon.spy();

			nock( API_DOMAIN )
				.post( '/rest/v1.1/sites/1/comments/1/likes/mine/delete' )
				.query( { source: 'reader' } )
				.reply( 200, {
					success: true,
					i_like: false,
					like_count: 122
				} );

			const unlikeThunk = unlikeComment( 1, 1, 1 );
			const apiPromise = unlikeThunk( dispatchSpy );

			expect( dispatchSpy ).to.be.calledWith( {
				type: COMMENTS_UNLIKE,
				siteId: 1,
				postId: 1,
				commentId: 1
			} );

			// since we didn't mock the request and we have disabled requests
			// we expect this to fail an revert the optimistic update
			return apiPromise.then( () => {
				expect( dispatchSpy ).to.be.calledWith( {
					type: COMMENTS_LIKE_UPDATE,
					siteId: 1,
					postId: 1,
					commentId: 1,
					iLike: false,
					likeCount: 122
				} );
			} );
		} );
	} ); // unlikeComment
} );
