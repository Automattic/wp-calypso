/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import {
	createReviewReply,
	deleteReviewReply,
	fetchReviewReplies,
	updateReviewReply,
} from '../actions';
import {
	WOOCOMMERCE_REVIEW_REPLIES_REQUEST,
	WOOCOMMERCE_REVIEW_REPLY_CREATE_REQUEST,
	WOOCOMMERCE_REVIEW_REPLY_DELETE_REQUEST,
	WOOCOMMERCE_REVIEW_REPLY_UPDATE_REQUEST,
} from 'woocommerce/state/action-types';

describe( 'actions', () => {
	describe( '#fetchReviewReplies()', () => {
		const siteId = '123';
		test( 'should return an action', () => {
			const reviewId = 5;
			const action = fetchReviewReplies( siteId, reviewId );
			expect( action ).to.eql( { type: WOOCOMMERCE_REVIEW_REPLIES_REQUEST, siteId, reviewId } );
		} );
	} );
	describe( '#createReviewReply()', () => {
		const siteId = '123';
		test( 'should return an action', () => {
			const reviewId = 5;
			const productId = 4;
			const action = createReviewReply( siteId, productId, reviewId, 'Hello world', false );
			expect( action ).to.eql( {
				type: WOOCOMMERCE_REVIEW_REPLY_CREATE_REQUEST,
				siteId,
				productId,
				reviewId,
				replyText: 'Hello world',
				shouldApprove: false,
			} );
		} );
	} );
	describe( '#deleteReviewReply()', () => {
		const siteId = '123';
		test( 'should return an action', () => {
			const reviewId = 5;
			const replyId = 6;
			const action = deleteReviewReply( siteId, reviewId, replyId );
			expect( action ).to.eql( {
				type: WOOCOMMERCE_REVIEW_REPLY_DELETE_REQUEST,
				siteId,
				reviewId,
				replyId,
			} );
		} );
	} );
	describe( '#updateReviewReply()', () => {
		const siteId = '123';
		test( 'should return an action', () => {
			const reviewId = 5;
			const replyId = 6;
			const changes = { content: 'test' };
			const action = updateReviewReply( siteId, reviewId, replyId, changes );
			expect( action ).to.eql( {
				type: WOOCOMMERCE_REVIEW_REPLY_UPDATE_REQUEST,
				siteId,
				reviewId,
				replyId,
				changes,
			} );
		} );
	} );
} );
