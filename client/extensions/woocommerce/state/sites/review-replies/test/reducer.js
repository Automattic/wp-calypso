/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { repliesUpdated } from '../reducer';
import reviewReplies from './fixtures/review-replies';
import { WOOCOMMERCE_REVIEW_REPLIES_UPDATED } from 'woocommerce/state/action-types';
import reducer from 'woocommerce/state/sites/reducer';

describe( 'reducer', () => {
	describe( 'repliesUpdate', () => {
		it( 'should have no change by default', () => {
			const newState = repliesUpdated( undefined, {} );
			expect( newState ).to.eql( {} );
		} );

		it( 'should store the replies response', () => {
			const action = {
				type: WOOCOMMERCE_REVIEW_REPLIES_UPDATED,
				siteId: 123,
				reviewId: 555,
				replies: reviewReplies,
			};
			const newState = repliesUpdated( undefined, action );
			expect( newState ).to.eql( { 555: reviewReplies } );
		} );

		it( 'should not update state on failure', () => {
			const action = {
				type: WOOCOMMERCE_REVIEW_REPLIES_UPDATED,
				siteId: 123,
				reviewId: 556,
				error: {},
			};
			const newState = repliesUpdated( { 555: reviewReplies }, action );
			expect( newState ).to.eql( { 555: reviewReplies } );
		} );

		it( 'should not update state for another site ID', () => {
			const action = {
				type: WOOCOMMERCE_REVIEW_REPLIES_UPDATED,
				siteId: 123,
				reviewId: 555,
				replies: reviewReplies,
			};

			const newState = reducer( {
				546: {
					reviewReplies: {}
				},
				123: {
					reviewReplies: {}
				}
			}, action );

			expect( newState[ 546 ].reviewReplies ).to.eql( {} );
			expect( newState[ 123 ].reviewReplies ).to.eql( { 555: reviewReplies } );
		} );
	} );
} );
