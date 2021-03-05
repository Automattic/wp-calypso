/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { fetchReviews, deleteReview, changeReviewStatus } from '../actions';
import {
	WOOCOMMERCE_REVIEWS_REQUEST,
	WOOCOMMERCE_REVIEW_DELETE,
	WOOCOMMERCE_REVIEW_STATUS_CHANGE,
} from 'woocommerce/state/action-types';

describe( 'actions', () => {
	describe( '#fetchReviews()', () => {
		const siteId = '123';
		test( 'should return an action', () => {
			const action = fetchReviews( siteId );
			expect( action ).to.eql( { type: WOOCOMMERCE_REVIEWS_REQUEST, siteId, query: {} } );
		} );
	} );
	describe( '#deleteReview()', () => {
		const siteId = '123';
		test( 'should return an action', () => {
			const action = deleteReview( siteId, 50, 250 );
			expect( action ).to.eql( {
				type: WOOCOMMERCE_REVIEW_DELETE,
				siteId,
				productId: 50,
				reviewId: 250,
			} );
		} );
	} );
	describe( '#changeReviewStatus()', () => {
		const siteId = '123';
		test( 'should return an action', () => {
			const action = changeReviewStatus( siteId, 50, 250, 'pending', 'approved' );
			expect( action ).to.eql( {
				type: WOOCOMMERCE_REVIEW_STATUS_CHANGE,
				siteId,
				productId: 50,
				reviewId: 250,
				currentStatus: 'pending',
				newStatus: 'approved',
			} );
		} );
	} );
} );
