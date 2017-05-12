/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import {
	DISCUSSIONS_COUNTS_UPDATE,
	DISCUSSIONS_ITEM_CONTENT_UPDATE_REQUESTING,
	DISCUSSIONS_ITEM_CONTENT_UPDATE_REQUEST_FAILURE,
	DISCUSSIONS_ITEM_CONTENT_UPDATE_REQUEST_SUCCESS,
	DISCUSSIONS_ITEM_LIKE_REQUESTING,
	DISCUSSIONS_ITEM_LIKE_REQUEST_FAILURE,
	DISCUSSIONS_ITEM_LIKE_REQUEST_SUCCESS,
	DISCUSSIONS_ITEM_STATUS_UPDATE_REQUESTING,
	DISCUSSIONS_ITEM_STATUS_UPDATE_REQUEST_FAILURE,
	DISCUSSIONS_ITEM_STATUS_UPDATE_REQUEST_SUCCESS,
	DISCUSSIONS_RECEIVE,
	DISCUSSIONS_REQUEST,
	DISCUSSIONS_REQUEST_FAILURE,
	DISCUSSIONS_REQUEST_SUCCESS,
	DISCUSSIONS_REQUESTING,
} from 'state/action-types';
import {
	requestPostComments,
	requestingPostComments,
	receivePostComments,
	successPostCommentsRequest,
	failPostCommentsRequest,
	receivePostCommentsCount,
	requestingCommentContentUpdate,
	successCommentContentUpdateRequest,
	failCommentContentUpdateRequest,
	requestingCommentLike,
	sucessCommentLikeRequest,
	failCommentLikeRequest,
	requestingCommentStatusUpdate,
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

	describe( '#requestingPostComments()', () => {
		it( 'should return an action object', () => {
			const action = requestingPostComments( 101010, 10, 'approved' );

			expect( action ).to.eql( {
				type: DISCUSSIONS_REQUESTING,
				siteId: 101010,
				postId: 10,
				status: 'approved'
			} );
		} );
	} );

	describe( '#receivePostComments()', () => {
		it( 'should return an action object', () => {
			const action = receivePostComments( 101010, [] );

			expect( action ).to.eql( {
				type: DISCUSSIONS_RECEIVE,
				siteId: 101010,
				comments: []
			} );
		} );
	} );

	describe( '#successPostCommentsRequest()', () => {
		it( 'should return an action object', () => {
			const action = successPostCommentsRequest( 101010, 10, 'approved' );

			expect( action ).to.eql( {
				type: DISCUSSIONS_REQUEST_SUCCESS,
				siteId: 101010,
				postId: 10,
				status: 'approved'
			} );
		} );
	} );

	describe( '#failPostCommentsRequest()', () => {
		it( 'should return an action object', () => {
			const action = failPostCommentsRequest( 101010, 10, 'approved' );

			expect( action ).to.eql( {
				type: DISCUSSIONS_REQUEST_FAILURE,
				siteId: 101010,
				postId: 10,
				status: 'approved'
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

	describe( '#requestingCommentContentUpdate()', () => {
		it( 'should return an action object', () => {
			const action = requestingCommentContentUpdate( 101010, 20 );

			expect( action ).to.eql( {
				type: DISCUSSIONS_ITEM_CONTENT_UPDATE_REQUESTING,
				siteId: 101010,
				commentId: 20
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

	describe( '#requestingCommentLike()', () => {
		it( 'should return an action object', () => {
			const action = requestingCommentLike( 101010, 20, 'reader' );

			expect( action ).to.eql( {
				type: DISCUSSIONS_ITEM_LIKE_REQUESTING,
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

	describe( '#requestingCommentStatusUpdate()', () => {
		it( 'should return an action object', () => {
			const action = requestingCommentStatusUpdate( 101010, 20 );

			expect( action ).to.eql( {
				type: DISCUSSIONS_ITEM_STATUS_UPDATE_REQUESTING,
				siteId: 101010,
				commentId: 20,
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
