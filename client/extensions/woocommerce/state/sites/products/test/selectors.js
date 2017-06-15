/**
 * External dependencies
 */
import { expect } from 'chai';
/**
 * Internal dependencies
 */
import {
	areProductsLoaded,
	areProductsLoading,
	getTotalProductsPages,
} from '../selectors';
import products from './fixtures/products';

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
					products: {
						isLoading: {
							1: true,
						},
						products: {},
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
					products: {
						isLoading: {
							1: false,
						},
						products,
						totalPages: 3
					}
				},
				401: {
					products: {
						isLoading: {
							1: true,
						},
						products: {},
						totalPages: 1
					},
				},
			},
		},
	},
};

const loadedStateWithUi = { ...loadedState, ui: { selectedSiteId: 123 } };

describe( 'selectors', () => {
	describe( '#areProductsLoaded', () => {
		it( 'should be false when woocommerce state is not available.', () => {
			expect( areProductsLoaded( preInitializedState, 1, 123 ) ).to.be.false;
		} );

		it( 'should be false when products are currently being fetched.', () => {
			expect( areProductsLoaded( loadingState, 1, 123 ) ).to.be.false;
		} );

		it( 'should be true when products are loaded.', () => {
			expect( areProductsLoaded( loadedState, 1, 123 ) ).to.be.true;
		} );

		it( 'should be false when products are loaded only for a different site.', () => {
			expect( areProductsLoaded( loadedState, 1, 456 ) ).to.be.false;
		} );

		it( 'should get the siteId from the UI tree if not provided.', () => {
			expect( areProductsLoaded( loadedStateWithUi, 1 ) ).to.be.true;
		} );
	} );

	describe( '#areProductsLoading', () => {
		it( 'should be false when woocommerce state is not available.', () => {
			expect( areProductsLoading( preInitializedState, 1, 123 ) ).to.be.false;
		} );

		it( 'should be true when products are currently being fetched.', () => {
			expect( areProductsLoading( loadingState, 1, 123 ) ).to.be.true;
		} );

		it( 'should be false when products are loaded.', () => {
			expect( areProductsLoading( loadedState, 1, 123 ) ).to.be.false;
		} );

		it( 'should be false when products are loaded only for a different site.', () => {
			expect( areProductsLoading( loadedState, 1, 456 ) ).to.be.false;
		} );

		it( 'should get the siteId from the UI tree if not provided.', () => {
			expect( areProductsLoading( loadedStateWithUi, 1 ) ).to.be.false;
		} );
	} );

	describe( '#getTotalProductsPages', () => {
		it( 'should be 0 (default) when woocommerce state is not available.', () => {
			expect( getTotalProductsPages( preInitializedState, 123 ) ).to.eql( 0 );
		} );

		it( 'should be 0 (default) when products are loading.', () => {
			expect( getTotalProductsPages( loadingState, 123 ) ).to.eql( 0 );
		} );

		it( 'should be 3, the set page total, if the products are loaded.', () => {
			expect( getTotalProductsPages( loadedState, 123 ) ).to.eql( 3 );
		} );

		it( 'should be 0 (default) when products are loaded only for a different site.', () => {
			expect( getTotalProductsPages( loadedState, 456 ) ).to.eql( 0 );
		} );

		it( 'should get the siteId from the UI tree if not provided.', () => {
			expect( getTotalProductsPages( loadedStateWithUi ) ).to.eql( 3 );
		} );
	} );
} );
