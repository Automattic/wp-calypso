/** @format */
/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import {
	getCurrentlyEditingReviewReplyId,
	getCurrentlyEditingReviewId,
	getReviewReplyEdits,
	getReviewReplyWithEdits,
	isCurrentlyEditingReviewReply,
} from '../selectors';

import reviewReplies from 'woocommerce/state/sites/review-replies/test/fixtures/review-replies';

const preInitializedState = {
	extensions: {
		woocommerce: {},
	},
};

const state = {
	ui: { selectedSiteId: 123 },
	extensions: {
		woocommerce: {
			sites: {
				123: {
					reviewReplies: {
						555: reviewReplies,
					},
				},
			},
			ui: {
				reviewReplies: {
					123: {
						edits: {
							currentlyEditingId: 556,
							reviewId: 555,
							changes: {
								content: 'Hello world.',
							},
						},
					},
					321: {
						edits: {
							currentlyEditingId: { placeholder: 'review_reply_1' },
							reviewId: 402,
							changes: {
								content: 'Testing',
							},
						},
					},
					111: {
						edits: {},
					},
				},
			},
		},
	},
};

describe( 'selectors', () => {
	describe( '#getCurrentlyEditingReviewReplyId', () => {
		it( 'should be null (default) when woocommerce state is not available', () => {
			expect( getCurrentlyEditingReviewReplyId( preInitializedState, 123 ) ).to.be.null;
		} );

		it( 'should get the correct ID when a reply is being edited', () => {
			expect( getCurrentlyEditingReviewReplyId( state, 123 ) ).to.eql( 556 );
		} );

		it( 'should get the correct ID when a new reply is being created', () => {
			expect( getCurrentlyEditingReviewReplyId( state, 321 ) ).to.eql( {
				placeholder: 'review_reply_1',
			} );
		} );

		it( 'should be null when no replies are being edited', () => {
			expect( getCurrentlyEditingReviewReplyId( state, 111 ) ).to.be.null;
		} );

		it( 'should get the siteId from the UI tree if not provided', () => {
			expect( getCurrentlyEditingReviewReplyId( state ) ).to.eql( 556 );
		} );
	} );

	describe( '#getCurrentlyEditingReviewId', () => {
		it( 'should be null (default) when woocommerce state is not available', () => {
			expect( getCurrentlyEditingReviewId( preInitializedState, 123 ) ).to.be.null;
		} );

		it( 'should get the correct ID when a reply is being edited', () => {
			expect( getCurrentlyEditingReviewId( state, 123 ) ).to.eql( 555 );
		} );

		it( 'should get the correct ID when a new reply is being created', () => {
			expect( getCurrentlyEditingReviewId( state, 321 ) ).to.eql( 402 );
		} );

		it( 'should be null when no replies are being edited', () => {
			expect( getCurrentlyEditingReviewId( state, 111 ) ).to.be.null;
		} );

		it( 'should get the siteId from the UI tree if not provided', () => {
			expect( getCurrentlyEditingReviewId( state ) ).to.eql( 555 );
		} );
	} );

	describe( '#getReviewReplyEdits', () => {
		it( 'should be an empty object (default) when woocommerce state is not available', () => {
			expect( getReviewReplyEdits( preInitializedState, 123 ) ).to.eql( {} );
		} );

		it( 'should get the changes when a reply is being edited', () => {
			expect( getReviewReplyEdits( state, 123 ) ).to.eql( { content: 'Hello world.' } );
		} );

		it( 'should get the new content when a new reply is being created', () => {
			expect( getReviewReplyEdits( state, 321 ) ).to.eql( { content: 'Testing' } );
		} );

		it( 'should be empty object when no replies are being edited', () => {
			expect( getReviewReplyEdits( state, 111 ) ).to.eql( {} );
		} );

		it( 'should get the siteId from the UI tree if not provided', () => {
			expect( getReviewReplyEdits( state ) ).to.eql( { content: 'Hello world.' } );
		} );
	} );

	describe( '#getReviewReplyWithEdits', () => {
		it( 'should be an empy object when woocommerce state is not available', () => {
			expect( getReviewReplyWithEdits( preInitializedState, 123 ) ).to.eql( {} );
		} );

		it( 'should merge the edited changes into the existing reply', () => {
			const review = reviewReplies[ 0 ];
			const mergedReview = { ...review, content: 'Hello world.' };
			expect( getReviewReplyWithEdits( state, 123 ) ).to.eql( mergedReview );
		} );

		it( 'should return just the changes for a new reply', () => {
			expect( getReviewReplyWithEdits( state, 321 ) ).to.eql( {
				content: 'Testing',
				id: { placeholder: 'review_reply_1' },
				parent: 402,
			} );
		} );
	} );

	describe( '#isCurrentlyEditingReviewReply', () => {
		it( 'should be false (default) when woocommerce state is not available', () => {
			expect( isCurrentlyEditingReviewReply( preInitializedState, 123 ) ).to.be.false;
		} );

		it( 'should be true when a reply is being edited', () => {
			expect( isCurrentlyEditingReviewReply( state, 123 ) ).to.be.true;
		} );

		it( 'should be true when a new reply is being created', () => {
			expect( isCurrentlyEditingReviewReply( state, 321 ) ).to.be.true;
		} );

		it( 'should be false when no replies are being edited', () => {
			expect( isCurrentlyEditingReviewReply( state, 111 ) ).to.be.false;
		} );

		it( 'should get the siteId from the UI tree if not provided', () => {
			expect( isCurrentlyEditingReviewReply( state ) ).to.be.true;
		} );
	} );
} );
