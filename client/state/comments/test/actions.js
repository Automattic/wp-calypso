/** @format */
/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import config from 'config';
import { useSandbox } from 'test/helpers/use-sinon';
import {
	COMMENTS_DELETE,
	COMMENTS_REQUEST,
	COMMENTS_LIKE,
	COMMENTS_UNLIKE,
	COMMENTS_WRITE,
	COMMENTS_REPLY_WRITE,
	COMMENTS_SET_ACTIVE_COMMENT_REPLY,
} from '../../action-types';
import {
	requestPostComments,
	writeComment,
	replyComment,
	deleteComment,
	likeComment,
	unlikeComment,
	setActiveCommentReply,
} from '../actions';
import { NUMBER_OF_COMMENTS_PER_FETCH } from '../constants';

const SITE_ID = 91750058;
const POST_ID = 287;

describe( 'actions', () => {
	describe( '#requestPostComments()', () => {
		useSandbox( sandbox => {
			sandbox
				.stub( config, 'isEnabled' )
				.withArgs( 'comments/filters-in-posts' )
				.returns( true );
		} );

		it( 'should return a comment request action', function() {
			const action = requestPostComments( { siteId: SITE_ID, postId: POST_ID, status: 'trash' } );

			expect( action ).to.eql( {
				type: COMMENTS_REQUEST,
				siteId: SITE_ID,
				postId: POST_ID,
				query: {
					order: 'DESC',
					number: NUMBER_OF_COMMENTS_PER_FETCH,
					status: 'trash',
				},
				direction: 'before',
			} );
		} );

		it( 'should return a comment request action with a default status of approved', function() {
			const action = requestPostComments( { siteId: SITE_ID, postId: POST_ID, status: undefined } );

			expect( action ).to.eql( {
				type: COMMENTS_REQUEST,
				siteId: SITE_ID,
				postId: POST_ID,
				direction: 'before',
				query: {
					order: 'DESC',
					number: NUMBER_OF_COMMENTS_PER_FETCH,
					status: 'approved',
				},
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

	describe( '#deleteComment()', () => {
		it( 'should dispatch remove for a placeholder when provided', () => {
			const deleteCommentAction = deleteComment( SITE_ID, POST_ID, 'placeholder-123' );

			expect( deleteCommentAction.type ).to.eql( COMMENTS_DELETE );
			expect( deleteCommentAction.commentId ).to.equal( 'placeholder-123' );
		} );
	} );

	describe( '#likeComment()', () => {
		it( 'should return a like comment action', () => {
			const action = likeComment( SITE_ID, POST_ID, 1 );

			expect( action ).to.eql( {
				type: COMMENTS_LIKE,
				siteId: SITE_ID,
				postId: POST_ID,
				commentId: 1,
			} );
		} );
	} );

	describe( '#unlikeComment()', () => {
		it( 'should return a comment unlike action', () => {
			const action = unlikeComment( SITE_ID, POST_ID, 1 );

			expect( action ).to.be.eql( {
				type: COMMENTS_UNLIKE,
				siteId: SITE_ID,
				postId: POST_ID,
				commentId: 1,
			} );
		} );
	} );

	describe( '#setActiveCommentReply()', () => {
		it( 'should return an action to set the active comment reply', () => {
			const action = setActiveCommentReply( SITE_ID, POST_ID, 1 );

			expect( action ).to.be.eql( {
				type: COMMENTS_SET_ACTIVE_COMMENT_REPLY,
				siteId: SITE_ID,
				postId: POST_ID,
				commentId: 1,
			} );
		} );
	} );
} );
