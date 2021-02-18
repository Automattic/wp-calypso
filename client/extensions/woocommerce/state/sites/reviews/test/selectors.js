/**
 * External dependencies
 */
import { expect } from 'chai';
import { keyBy } from 'lodash';

/**
 * Internal dependencies
 */
import {
	areReviewsLoaded,
	areReviewsLoading,
	getReview,
	getReviews,
	getTotalReviews,
} from '../selectors';
import review from './fixtures/review';
import reviews from './fixtures/reviews';
const additionalReviews = [ review ];

const preInitializedState = {
	extensions: {
		woocommerce: {},
	},
};
const loadingState = {
	extensions: {
		woocommerce: {
			sites: {
				123: {
					reviews: {
						isQueryLoading: {
							'{}': true,
						},
						items: {},
						queries: {},
						total: { '{}': 0 },
					},
				},
			},
		},
	},
};
const loadedState = {
	extensions: {
		woocommerce: {
			sites: {
				123: {
					reviews: {
						isQueryLoading: {
							'{}': false,
						},
						items: keyBy( reviews, 'id' ),
						queries: {
							'{}': [ 100, 105 ],
						},
						total: { '{}': 29 },
					},
				},
				321: {
					reviews: {
						isQueryLoading: {
							'{}': false,
						},
						items: keyBy( [ ...reviews, ...additionalReviews ], 'id' ),
					},
				},
			},
		},
	},
};

const loadedStateWithUi = { ...loadedState, ui: { selectedSiteId: 123 } };

describe( 'selectors', () => {
	describe( '#areReviewsLoaded', () => {
		test( 'should be false when woocommerce state is not available.', () => {
			expect( areReviewsLoaded( preInitializedState, 1, 123 ) ).to.be.false;
		} );

		test( 'should be false when reviews are currently being fetched.', () => {
			expect( areReviewsLoaded( loadingState, 1, 123 ) ).to.be.false;
		} );

		test( 'should be true when reviews are loaded.', () => {
			expect( areReviewsLoaded( loadedState, 1, 123 ) ).to.be.true;
		} );

		test( 'should be false when reviews are loaded only for a different site.', () => {
			expect( areReviewsLoaded( loadedState, 1, 456 ) ).to.be.false;
		} );

		test( 'should get the siteId from the UI tree if not provided.', () => {
			expect( areReviewsLoaded( loadedStateWithUi, 1 ) ).to.be.true;
		} );
	} );

	describe( '#areReviewsLoading', () => {
		test( 'should be false when woocommerce state is not available.', () => {
			expect( areReviewsLoading( preInitializedState, 1, 123 ) ).to.be.false;
		} );

		test( 'should be true when reviews are currently being fetched.', () => {
			expect( areReviewsLoading( loadingState, 1, 123 ) ).to.be.true;
		} );

		test( 'should be false when reviews are loaded.', () => {
			expect( areReviewsLoading( loadedState, 1, 123 ) ).to.be.false;
		} );

		test( 'should be false when reviews are loaded only for a different site.', () => {
			expect( areReviewsLoading( loadedState, 1, 456 ) ).to.be.false;
		} );

		test( 'should get the siteId from the UI tree if not provided.', () => {
			expect( areReviewsLoading( loadedStateWithUi, 1 ) ).to.be.false;
		} );
	} );

	describe( '#getReviews', () => {
		test( 'should be an empty array when woocommerce state is not available.', () => {
			expect( getReviews( preInitializedState, {}, 123 ) ).to.be.empty;
		} );

		test( 'should be an empty array when reviews are loading.', () => {
			expect( getReviews( loadingState, {}, 123 ) ).to.be.empty;
		} );

		test( 'should be the list of reviews if they are loaded.', () => {
			expect( getReviews( loadedState, {}, 123 ) ).to.eql( reviews );
		} );

		test( 'should be an empty array when reviews are loaded only for a different site.', () => {
			expect( getReviews( loadedState, {}, 456 ) ).to.be.empty;
		} );

		test( 'should get the siteId from the UI tree if not provided.', () => {
			expect( getReviews( loadedStateWithUi ) ).to.eql( reviews );
		} );
	} );

	describe( '#getTotalReviews', () => {
		test( 'should be 0 (default) when woocommerce state is not available.', () => {
			expect( getTotalReviews( preInitializedState, {}, 123 ) ).to.eql( 0 );
		} );

		test( 'should be 0 (default) when reviews are loading.', () => {
			expect( getTotalReviews( loadingState, {}, 123 ) ).to.eql( 0 );
		} );

		test( 'should be 29, the set total, if the reviews are loaded.', () => {
			expect( getTotalReviews( loadedState, {}, 123 ) ).to.eql( 29 );
		} );

		test( 'should be 0 (default) when reviews are loaded only for a different site.', () => {
			expect( getTotalReviews( loadedState, {}, 456 ) ).to.eql( 0 );
		} );

		test( 'should get the siteId from the UI tree if not provided.', () => {
			expect( getTotalReviews( loadedStateWithUi ) ).to.eql( 29 );
		} );
	} );

	describe( '#getReview', () => {
		test( 'should be null when woocommerce state is not available.', () => {
			expect( getReview( preInitializedState, 100, 123 ) ).to.be.null;
		} );

		test( 'should be null when reviews are loading.', () => {
			expect( getReview( loadingState, 100, 123 ) ).to.be.null;
		} );

		test( 'should be the review object if it is loaded.', () => {
			expect( getReview( loadedState, 100, 123 ) ).to.eql( reviews[ 0 ] );
		} );

		test( 'should be null when reviews are loaded only for a different site.', () => {
			expect( getReview( loadedState, 105, 456 ) ).to.be.null;
		} );

		test( 'should get the siteId from the UI tree if not provided.', () => {
			expect( getReview( loadedStateWithUi, 105 ) ).to.eql( reviews[ 1 ] );
		} );
	} );
} );
