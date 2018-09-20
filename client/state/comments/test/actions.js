/** @format */
/**
 * Internal dependencies
 */
import {
	COMMENTS_DELETE,
	COMMENTS_REQUEST,
	COMMENTS_LIKE,
	COMMENTS_UNLIKE,
	COMMENTS_WRITE,
	COMMENTS_REPLY_WRITE,
	COMMENTS_SET_ACTIVE_REPLY,
} from '../../action-types';
import {
	requestPostComments,
	writeComment,
	replyComment,
	deleteComment,
	likeComment,
	unlikeComment,
	setActiveReply,
} from '../actions';
import { NUMBER_OF_COMMENTS_PER_FETCH } from '../constants';
import { setFeatureFlag } from 'test/helpers/config';

const SITE_ID = 91750058;
const POST_ID = 287;

describe( 'actions', () => {
	describe( '#requestPostComments()', () => {
		setFeatureFlag( 'comments/filters-in-posts', true );

		test( 'should return a comment request action', () => {
			const action = requestPostComments( {
				siteId: SITE_ID,
				postId: POST_ID,
				status: 'trash',
			} );

			expect( action ).toMatchObject( {
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

		test( 'should return a comment request action with a default status of approved', () => {
			const action = requestPostComments( {
				siteId: SITE_ID,
				postId: POST_ID,
				status: undefined,
			} );

			expect( action ).toMatchObject( {
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
		test( 'should return a write comment action', () => {
			const action = writeComment( 'comment text', SITE_ID, POST_ID );

			expect( action ).toMatchObject( {
				type: COMMENTS_WRITE,
				siteId: SITE_ID,
				postId: POST_ID,
				commentText: 'comment text',
			} );
		} );
	} );

	describe( '#replyComment()', () => {
		test( 'should return a write comment action', () => {
			const action = replyComment( 'comment text', SITE_ID, POST_ID, 1 );

			expect( action ).toMatchObject( {
				type: COMMENTS_REPLY_WRITE,
				siteId: SITE_ID,
				postId: POST_ID,
				parentCommentId: 1,
				commentText: 'comment text',
				refreshCommentListQuery: null,
			} );
		} );
	} );

	describe( '#deleteComment()', () => {
		test( 'should dispatch remove for a placeholder when provided', () => {
			const deleteCommentAction = deleteComment( SITE_ID, POST_ID, 'placeholder-123' );

			expect( deleteCommentAction.type ).toEqual( COMMENTS_DELETE );
			expect( deleteCommentAction.commentId ).toEqual( 'placeholder-123' );
		} );
	} );

	describe( '#likeComment()', () => {
		test( 'should return a like comment action', () => {
			const action = likeComment( SITE_ID, POST_ID, 1 );

			expect( action ).toMatchObject( {
				type: COMMENTS_LIKE,
				siteId: SITE_ID,
				postId: POST_ID,
				commentId: 1,
			} );
		} );
	} );

	describe( '#unlikeComment()', () => {
		test( 'should return a comment unlike action', () => {
			const action = unlikeComment( SITE_ID, POST_ID, 1 );

			expect( action ).toMatchObject( {
				type: COMMENTS_UNLIKE,
				siteId: SITE_ID,
				postId: POST_ID,
				commentId: 1,
			} );
		} );
	} );

	describe( '#setActiveReply()', () => {
		test( 'should return an action to set the active comment reply', () => {
			const action = setActiveReply( { siteId: SITE_ID, postId: POST_ID, commentId: 1 } );

			expect( action ).toMatchObject( {
				type: COMMENTS_SET_ACTIVE_REPLY,
				payload: {
					siteId: SITE_ID,
					postId: POST_ID,
					commentId: 1,
				},
			} );
		} );
	} );
} );
