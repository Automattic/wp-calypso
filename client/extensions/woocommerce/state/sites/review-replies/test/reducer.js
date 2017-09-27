/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import {
	repliesUpdated,
	replyDeleted,
	replyUpdated,
} from '../reducer';
import reducer from 'woocommerce/state/sites/reducer';
import {
	WOOCOMMERCE_REVIEW_REPLIES_UPDATED,
	WOOCOMMERCE_REVIEW_REPLY_DELETED,
	WOOCOMMERCE_REVIEW_REPLY_UPDATED,
} from 'woocommerce/state/action-types';
import reviewReplies from './fixtures/review-replies';

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
	describe( 'replyDeleted', () => {
		it( 'should have no change by default', () => {
			const newState = replyDeleted( undefined, {} );
			expect( newState ).to.eql( {} );
		} );

		it( 'should remove the reply from the list', () => {
			const action = {
				type: WOOCOMMERCE_REVIEW_REPLY_DELETED,
				siteId: 123,
				reviewId: 555,
				replyId: 556,
			};
			const newState = replyDeleted( { 555: reviewReplies }, action );
			expect( newState ).to.eql( { 555: [ reviewReplies[ 1 ] ] } );
		} );
	} );
	describe( 'replyUpdated', () => {
		it( 'should have no change by default', () => {
			const newState = replyUpdated( undefined, {} );
			expect( newState ).to.eql( {} );
		} );

		it( 'should update the reply in the list', () => {
			const update = { ...reviewReplies[ 0 ], content: 'Updated' };
			const action = {
				type: WOOCOMMERCE_REVIEW_REPLY_UPDATED,
				siteId: 123,
				reviewId: 555,
				replyId: 556,
				reply: update,
			};
			const newState = replyUpdated( { 555: reviewReplies }, action );
			expect( newState[ 555 ][ 0 ].content ).to.eql( 'Updated' );
			expect( newState[ 555 ][ 1 ] ).to.eql( reviewReplies[ 1 ] );
		} );
	} );
} );
