/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import {
	DISCUSSIONS_COUNTS_UPDATE,
	DISCUSSIONS_ITEM_CONTENT_UPDATE_REQUEST,
	DISCUSSIONS_ITEM_CONTENT_UPDATE_REQUEST_FAILURE,
	DISCUSSIONS_ITEM_CONTENT_UPDATE_REQUEST_SUCCESS,
	DISCUSSIONS_ITEM_LIKE_REQUEST,
	DISCUSSIONS_ITEM_LIKE_REQUEST_FAILURE,
	DISCUSSIONS_ITEM_LIKE_REQUEST_SUCCESS,
	DISCUSSIONS_ITEM_STATUS_UPDATE_REQUEST,
	DISCUSSIONS_ITEM_STATUS_UPDATE_REQUEST_FAILURE,
	DISCUSSIONS_ITEM_STATUS_UPDATE_REQUEST_SUCCESS,
	DISCUSSIONS_ITEM_UNLIKE_REQUEST,
	DISCUSSIONS_REQUEST,
	DISCUSSIONS_REQUEST_FAILURE,
	DISCUSSIONS_REQUEST_SUCCESS,
} from 'state/action-types';
import {
	requestPostComments,
	successPostCommentsRequest,
	failPostCommentsRequest,
	receivePostCommentsCount,
	requestCommentContentUpdate,
	successCommentContentUpdateRequest,
	failCommentContentUpdateRequest,
	requestCommentLike,
	requestCommentUnLike,
	sucessCommentLikeRequest,
	failCommentLikeRequest,
	requestCommentStatusUpdate,
	successCommentStatusUpdateRequest,
	failCommentStatusUpdateRequest
} from '../actions';

describe( 'actions', () => {
	describe( '#requestPostComments()', () => {
		it( 'should return an action object defaulting to all status', () => {
			const action = requestPostComments( 101010, 10 );

			expect( action ).to.eql( {
				type: DISCUSSIONS_REQUEST,
				siteId: 101010,
				postId: 10,
				status: 'all'
			} );
		} );

		it( 'should return an action object', () => {
			const action = requestPostComments( 101010, 10, 'approved' );

			expect( action ).to.eql( {
				type: DISCUSSIONS_REQUEST,
				siteId: 101010,
				postId: 10,
				status: 'approved'
			} );
		} );
	} );

	describe( '#successPostCommentsRequest()', () => {
		it( 'should return an action object', () => {
			const action = successPostCommentsRequest( 101010, 10, 'approved', [] );

			expect( action ).to.eql( {
				type: DISCUSSIONS_REQUEST_SUCCESS,
				siteId: 101010,
				postId: 10,
				status: 'approved',
				comments: [],
			} );
		} );
	} );

	describe( '#failPostCommentsRequest()', () => {
		it( 'should return an action object', () => {
			const action = failPostCommentsRequest( 101010, 10, 'approved', 'error' );

			expect( action ).to.eql( {
				type: DISCUSSIONS_REQUEST_FAILURE,
				siteId: 101010,
				postId: 10,
				status: 'approved',
				error: 'error',
			} );
		} );
	} );

	describe( '#receivePostCommentsCount()', () => {
		it( 'should return an action object', () => {
			const action = receivePostCommentsCount( 101010, 10, 5 );

			expect( action ).to.eql( {
				type: DISCUSSIONS_COUNTS_UPDATE,
				siteId: 101010,
				postId: 10,
				count: 5
			} );
		} );
	} );

	describe( '#requestCommentContentUpdate()', () => {
		it( 'should return an action object', () => {
			const action = requestCommentContentUpdate( 101010, 20, 'lorem ipsum' );

			expect( action ).to.eql( {
				type: DISCUSSIONS_ITEM_CONTENT_UPDATE_REQUEST,
				siteId: 101010,
				commentId: 20,
				content: 'lorem ipsum'
			} );
		} );
	} );

	describe( '#successCommentContentUpdateRequest()', () => {
		it( 'should return an action object', () => {
			const action = successCommentContentUpdateRequest( 101010, 20, 'lorem ipsum' );

			expect( action ).to.eql( {
				type: DISCUSSIONS_ITEM_CONTENT_UPDATE_REQUEST_SUCCESS,
				siteId: 101010,
				commentId: 20,
				content: 'lorem ipsum'
			} );
		} );
	} );

	describe( '#failCommentContentUpdateRequest()', () => {
		it( 'should return an action object', () => {
			const action = failCommentContentUpdateRequest( 101010, 20, 'lorem ipsum', { error: 'error' } );

			expect( action ).to.eql( {
				type: DISCUSSIONS_ITEM_CONTENT_UPDATE_REQUEST_FAILURE,
				siteId: 101010,
				commentId: 20,
				content: 'lorem ipsum',
				error: { error: 'error' }
			} );
		} );
	} );

	describe( '#requestCommentLike()', () => {
		it( 'should return an action object', () => {
			const action = requestCommentLike( 101010, 20, 'reader' );

			expect( action ).to.eql( {
				type: DISCUSSIONS_ITEM_LIKE_REQUEST,
				siteId: 101010,
				commentId: 20,
				source: 'reader'
			} );
		} );
	} );

	describe( '#requestCommentUnLike()', () => {
		it( 'should return an action object', () => {
			const action = requestCommentUnLike( 101010, 20, 'reader' );

			expect( action ).to.eql( {
				type: DISCUSSIONS_ITEM_UNLIKE_REQUEST,
				siteId: 101010,
				commentId: 20,
				source: 'reader'
			} );
		} );
	} );

	describe( '#sucessCommentLikeRequest()', () => {
		it( 'should return an action object', () => {
			const action = sucessCommentLikeRequest( 101010, 20, 'reader', true, 5 );

			expect( action ).to.eql( {
				type: DISCUSSIONS_ITEM_LIKE_REQUEST_SUCCESS,
				siteId: 101010,
				commentId: 20,
				source: 'reader',
				iLike: true,
				likeCount: 5
			} );
		} );
	} );

	describe( '#failCommentLikeRequest()', () => {
		it( 'should return an action object', () => {
			const action = failCommentLikeRequest( 101010, 20, 'reader', { error: 'error' } );

			expect( action ).to.eql( {
				type: DISCUSSIONS_ITEM_LIKE_REQUEST_FAILURE,
				siteId: 101010,
				commentId: 20,
				source: 'reader',
				error: { error: 'error' }
			} );
		} );
	} );

	describe( '#requestCommentStatusUpdate()', () => {
		it( 'should return an action object', () => {
			const action = requestCommentStatusUpdate( 101010, 20, 'approved' );

			expect( action ).to.eql( {
				type: DISCUSSIONS_ITEM_STATUS_UPDATE_REQUEST,
				siteId: 101010,
				commentId: 20,
				status: 'approved',
			} );
		} );
	} );

	describe( '#successCommentStatusUpdateRequest()', () => {
		it( 'should return an action object', () => {
			const action = successCommentStatusUpdateRequest( 101010, 20, 'approved' );

			expect( action ).to.eql( {
				type: DISCUSSIONS_ITEM_STATUS_UPDATE_REQUEST_SUCCESS,
				siteId: 101010,
				commentId: 20,
				status: 'approved',
			} );
		} );
	} );

	describe( '#failCommentStatusUpdateRequest()', () => {
		it( 'should return an action object', () => {
			const action = failCommentStatusUpdateRequest( 101010, 20, 'approved', { error: 'error' } );

			expect( action ).to.eql( {
				type: DISCUSSIONS_ITEM_STATUS_UPDATE_REQUEST_FAILURE,
				siteId: 101010,
				commentId: 20,
				status: 'approved',
				error: { error: 'error' }
			} );
		} );
	} );
} );
