/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { fetchReviewReplies } from '../actions';
import { WOOCOMMERCE_REVIEW_REPLIES_REQUEST } from 'woocommerce/state/action-types';

describe( 'actions', () => {
	describe( '#fetchReviewReplies()', () => {
		const siteId = '123';
		it( 'should return an action', () => {
			const reviewId = 5;
			const action = fetchReviewReplies( siteId, reviewId );
			expect( action ).to.eql( { type: WOOCOMMERCE_REVIEW_REPLIES_REQUEST, siteId, reviewId } );
		} );
	} );
} );
