/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { clearReviewReplyEdits, editReviewReply } from '../actions';
import {
	WOOCOMMERCE_UI_REVIEW_REPLIES_CLEAR_EDIT,
	WOOCOMMERCE_UI_REVIEW_REPLIES_EDIT,
} from 'woocommerce/state/action-types';

describe( 'actions', () => {
	describe( '#clearReviewReplyEdits()', () => {
		const siteId = '123';
		test( 'should return an action', () => {
			const action = clearReviewReplyEdits( siteId );
			expect( action ).to.eql( {
				type: WOOCOMMERCE_UI_REVIEW_REPLIES_CLEAR_EDIT,
				siteId,
			} );
		} );
	} );
	describe( '#editReviewReply()', () => {
		const siteId = '123';
		test( 'should return an action', () => {
			const reply = { id: 50, content: 'testing' };
			const action = editReviewReply( siteId, 50, reply );
			expect( action ).to.eql( {
				type: WOOCOMMERCE_UI_REVIEW_REPLIES_EDIT,
				siteId,
				reviewId: 50,
				reply,
			} );
		} );
	} );
} );
