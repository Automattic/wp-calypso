/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { repliesUpdated, replyCreated, replyDeleted, replyUpdated } from '../reducer';
import reviewReplies from './fixtures/review-replies';
import {
	WOOCOMMERCE_REVIEW_REPLIES_UPDATED,
	WOOCOMMERCE_REVIEW_REPLY_CREATED,
	WOOCOMMERCE_REVIEW_REPLY_DELETED,
	WOOCOMMERCE_REVIEW_REPLY_UPDATED,
} from 'woocommerce/state/action-types';
import reducer from 'woocommerce/state/sites/reducer';

describe( 'reducer', () => {
	describe( 'repliesUpdate', () => {
		test( 'should have no change by default', () => {
			const newState = repliesUpdated( undefined, {} );
			expect( newState ).to.eql( {} );
		} );

		test( 'should store the replies response', () => {
			const action = {
				type: WOOCOMMERCE_REVIEW_REPLIES_UPDATED,
				siteId: 123,
				reviewId: 555,
				replies: reviewReplies,
			};
			const newState = repliesUpdated( undefined, action );
			expect( newState ).to.eql( { 555: reviewReplies } );
		} );

		test( 'should not update state on failure', () => {
			const action = {
				type: WOOCOMMERCE_REVIEW_REPLIES_UPDATED,
				siteId: 123,
				reviewId: 556,
				error: {},
			};
			const newState = repliesUpdated( { 555: reviewReplies }, action );
			expect( newState ).to.eql( { 555: reviewReplies } );
		} );

		test( 'should not update state for another site ID', () => {
			const action = {
				type: WOOCOMMERCE_REVIEW_REPLIES_UPDATED,
				siteId: 123,
				reviewId: 555,
				replies: reviewReplies,
			};

			const newState = reducer(
				{
					546: {
						reviewReplies: {},
					},
					123: {
						reviewReplies: {},
					},
				},
				action
			);

			expect( newState[ 546 ].reviewReplies ).to.eql( {} );
			expect( newState[ 123 ].reviewReplies ).to.eql( { 555: reviewReplies } );
		} );
	} );
	describe( 'replyDeleted', () => {
		test( 'should have no change by default', () => {
			const newState = replyDeleted( undefined, {} );
			expect( newState ).to.eql( {} );
		} );

		test( 'should remove the reply from the list', () => {
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
		test( 'should have no change by default', () => {
			const newState = replyUpdated( undefined, {} );
			expect( newState ).to.eql( {} );
		} );

		test( 'should update the reply in the list', () => {
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
	describe( 'replyCreated', () => {
		test( 'should have no change by default', () => {
			const newState = replyCreated( undefined, {} );
			expect( newState ).to.eql( {} );
		} );

		test( 'should add the reply to the list', () => {
			const create = { content: 'New comment...' };
			const action = {
				type: WOOCOMMERCE_REVIEW_REPLY_CREATED,
				siteId: 123,
				reviewId: 555,
				replyId: 556,
				reply: create,
			};

			expect( reviewReplies.length ).to.eql( 2 );
			const newState = replyCreated( { 555: reviewReplies }, action );
			expect( newState[ 555 ][ 2 ].content ).to.eql( 'New comment...' );
			expect( newState[ 555 ].length ).to.eql( 3 );
		} );
	} );
} );
