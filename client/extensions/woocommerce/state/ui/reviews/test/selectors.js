/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import {
	getReviewsCurrentPage,
	getReviewsCurrentSearch,
	getReviewsCurrentProduct,
} from '../selectors';

const preInitializedState = {
	extensions: {
		woocommerce: {},
	},
};

const state = {
	ui: { selectedSiteId: 123 },
	extensions: {
		woocommerce: {
			ui: {
				reviews: {
					123: {
						list: {
							currentPage: 2,
							currentSearch: 'example',
							currentProduct: 50,
						},
					},
					234: {
						list: {
							currentPage: 5,
							currentSearch: 'test',
						},
					},
				},
			},
		},
	},
};

describe( 'selectors', () => {
	describe( '#getReviewsCurrentPage', () => {
		test( 'should be 1 (default) when woocommerce state is not available', () => {
			expect( getReviewsCurrentPage( preInitializedState, 123 ) ).to.eql( 1 );
		} );

		test( 'should get the current reviews page', () => {
			expect( getReviewsCurrentPage( state, 123 ) ).to.eql( 2 );
		} );

		test( 'should get the current reviews page for a second site in the state', () => {
			expect( getReviewsCurrentPage( state, 234 ) ).to.eql( 5 );
		} );

		test( 'should get the siteId from the UI tree if not provided', () => {
			expect( getReviewsCurrentPage( state ) ).to.eql( 2 );
		} );
	} );

	describe( '#getReviewsCurrentSearch', () => {
		test( 'should be empty (default) when woocommerce state is not available', () => {
			expect( getReviewsCurrentSearch( preInitializedState, 123 ) ).to.eql( '' );
		} );

		test( 'should get the current reviews search term', () => {
			expect( getReviewsCurrentSearch( state, 123 ) ).to.eql( 'example' );
		} );

		test( 'should get the current reviews search term for a second site in the state', () => {
			expect( getReviewsCurrentSearch( state, 234 ) ).to.eql( 'test' );
		} );

		test( 'should get the siteId from the UI tree if not provided', () => {
			expect( getReviewsCurrentSearch( state ) ).to.eql( 'example' );
		} );
	} );

	describe( '#getReviewsCurrentProduct', () => {
		test( 'should be null (default) when woocommerce state is not available', () => {
			expect( getReviewsCurrentProduct( preInitializedState, 123 ) ).to.eql( null );
		} );

		test( 'should get current reviews product', () => {
			expect( getReviewsCurrentProduct( state, 123 ) ).to.eql( 50 );
		} );

		test( 'should get null for a second site in the state when no current product is set', () => {
			expect( getReviewsCurrentProduct( state, 234 ) ).to.eql( null );
		} );

		test( 'should get the siteId from the UI tree if not provided', () => {
			expect( getReviewsCurrentProduct( state ) ).to.eql( 50 );
		} );
	} );
} );
