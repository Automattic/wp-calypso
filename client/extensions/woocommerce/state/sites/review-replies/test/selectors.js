/** @format */
/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { getReviewReplies, getReviewReply } from '../selectors';
import reviewReplies from './fixtures/review-replies';

const preInitializedState = {
	extensions: {
		woocommerce: {},
	},
};
const loadingState = {
	extensions: {
		woocommerce: {},
	},
};
const loadedState = {
	extensions: {
		woocommerce: {
			sites: {
				123: {
					reviewReplies: {
						555: reviewReplies,
					},
				},
				321: {
					reviewReplies: {
						556: [],
					},
				},
			},
		},
	},
};

const loadedStateWithUi = { ...loadedState, ui: { selectedSiteId: 123 } };

describe( 'selectors', () => {
	describe( '#getReviewReplies', () => {
		it( 'should be false when woocommerce state is not available.', () => {
			expect( getReviewReplies( preInitializedState, 555, 123 ) ).to.be.false;
		} );

		it( 'should be false when review replies are loading.', () => {
			expect( getReviewReplies( loadingState, 555, 123 ) ).to.be.empty;
		} );

		it( 'should be the list of replies if they are loaded.', () => {
			expect( getReviewReplies( loadedState, 555, 123 ) ).to.eql( reviewReplies );
		} );

		it( 'should be the list of replies if they are loaded for a different site.', () => {
			expect( getReviewReplies( loadedState, 556, 321 ) ).to.eql( [] );
		} );

		it( 'should be false when reviews are loaded only for a different site.', () => {
			expect( getReviewReplies( loadedState, 555, 456 ) ).to.be.false;
		} );

		it( 'should get the siteId from the UI tree if not provided.', () => {
			expect( getReviewReplies( loadedStateWithUi, 555 ) ).to.eql( reviewReplies );
		} );
	} );
	describe( '#getReviewReply', () => {
		it( 'should be false when woocommerce state is not available.', () => {
			expect( getReviewReply( preInitializedState, 555, 556, 123 ) ).to.be.false;
		} );

		it( 'should be false when review replies are loading.', () => {
			expect( getReviewReply( loadingState, 555, 556, 123 ) ).to.be.empty;
		} );

		it( 'should return reply content if replies are loaded.', () => {
			expect( getReviewReply( loadedState, 555, 556, 123 ) ).to.eql( reviewReplies[ 0 ] );
		} );

		it( 'should be false when reviews are loaded only for a different site.', () => {
			expect( getReviewReply( loadedState, 555, 556, 456 ) ).to.be.false;
		} );

		it( 'should get the siteId from the UI tree if not provided.', () => {
			expect( getReviewReply( loadedStateWithUi, 555, 556 ) ).to.eql( reviewReplies[ 0 ] );
		} );
	} );
} );
