/**
 * External dependencies
 */
import { expect } from 'chai';
/**
 * Internal dependencies
 */
import {
	getProduct,
	areProductsLoaded,
	areProductsLoading,
	areProductsError,
	getTotalProductsPages,
	getTotalProducts,
	areProductSearchResultsLoaded,
	areProductSearchResultsLoading,
	getTotalProductSearchResults,
	getProductSearchQuery,
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
							2: true,
						},
						search: {
							isLoading: {
								1: true,
							},
							query: 'testing',
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
						search: {
							isLoading: {
								1: false,
								2: false,
							},
							totalProducts: 28,
							query: 'testing',
						},
						isLoading: {
							1: false,
						},
						isError: {
							2: true,
						},
						products,
						totalPages: 3,
						totalProducts: 30,
					}
				},
				401: {
					products: {
						search: {
							isLoading: {
								1: true,
							}
						},
						isLoading: {
							1: true,
						},
						products: {},
						totalPages: 1,
					},
				},
			},
		},
	},
};

const loadedStateWithUi = { ...loadedState, ui: { selectedSiteId: 123 } };

describe( 'selectors', () => {
	describe( '#getProduct', () => {
		it( 'should give the product object when present.', () => {
			const wooLogo = getProduct( loadedState, 15, 123 );

			expect( wooLogo.id ).to.equal( 15 );
			expect( wooLogo.name ).to.equal( 'Woo Logo' );
		} );

		it( 'should return undefined if the product is not present.', () => {
			const nonexistentId = 250002;
			expect( getProduct( loadedState, nonexistentId, 123 ) ).to.be.undefined;
		} );
	} );

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

	describe( '#areProductsError', () => {
		it( 'should be false when woocommerce state is not available.', () => {
			expect( areProductsError( preInitializedState, 2, 123 ) ).to.be.false;
		} );

		it( 'should be false when products are currently being fetched.', () => {
			expect( areProductsError( loadingState, 2, 123 ) ).to.be.false;
		} );

		it( 'should be false when products are loaded correctly.', () => {
			expect( areProductsError( loadedState, 1, 123 ) ).to.be.false;
		} );

		it( 'should be true when products failed to load.', () => {
			expect( areProductsError( loadedState, 2, 123 ) ).to.be.true;
		} );

		it( 'should be false when products are loaded only for a different site.', () => {
			expect( areProductsError( loadedState, 2, 456 ) ).to.be.false;
		} );

		it( 'should get the siteId from the UI tree if not provided.', () => {
			expect( areProductsError( loadedStateWithUi, 2 ) ).to.be.true;
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

	describe( '#getTotalProducts', () => {
		it( 'should be 0 (default) when woocommerce state is not available.', () => {
			expect( getTotalProducts( preInitializedState, 123 ) ).to.eql( 0 );
		} );

		it( 'should be 0 (default) when products are loading.', () => {
			expect( getTotalProducts( loadingState, 123 ) ).to.eql( 0 );
		} );

		it( 'should be 30, the set products total, if the products are loaded.', () => {
			expect( getTotalProducts( loadedState, 123 ) ).to.eql( 30 );
		} );

		it( 'should be 0 (default) when products are loaded only for a different site.', () => {
			expect( getTotalProducts( loadedState, 456 ) ).to.eql( 0 );
		} );

		it( 'should get the siteId from the UI tree if not provided.', () => {
			expect( getTotalProducts( loadedStateWithUi ) ).to.eql( 30 );
		} );
	} );
	describe( '#areProductSearchResultsLoaded', () => {
		it( 'should be false when woocommerce state is not available.', () => {
			expect( areProductSearchResultsLoaded( preInitializedState, 1, 123 ) ).to.be.false;
		} );

		it( 'should be false when products are currently being fetched.', () => {
			expect( areProductSearchResultsLoaded( loadingState, 1, 123 ) ).to.be.false;
		} );

		it( 'should be true when products are loaded.', () => {
			expect( areProductSearchResultsLoaded( loadedState, 1, 123 ) ).to.be.true;
		} );

		it( 'should be false when products are loaded only for a different site.', () => {
			expect( areProductSearchResultsLoaded( loadedState, 1, 456 ) ).to.be.false;
		} );

		it( 'should get the siteId from the UI tree if not provided.', () => {
			expect( areProductSearchResultsLoaded( loadedStateWithUi, 1 ) ).to.be.true;
		} );
	} );

	describe( '#areProductSearchResultsLoading', () => {
		it( 'should be false when woocommerce state is not available.', () => {
			expect( areProductSearchResultsLoading( preInitializedState, 1, 123 ) ).to.be.false;
		} );

		it( 'should be true when products are currently being fetched.', () => {
			expect( areProductSearchResultsLoading( loadingState, 1, 123 ) ).to.be.true;
		} );

		it( 'should be false when products are loaded.', () => {
			expect( areProductSearchResultsLoading( loadedState, 1, 123 ) ).to.be.false;
		} );

		it( 'should be false when products are loaded only for a different site.', () => {
			expect( areProductSearchResultsLoading( loadedState, 1, 456 ) ).to.be.false;
		} );

		it( 'should get the siteId from the UI tree if not provided.', () => {
			expect( areProductSearchResultsLoading( loadedStateWithUi, 1 ) ).to.be.false;
		} );
	} );

	describe( '#getTotalProductSearchResults', () => {
		it( 'should be 0 (default) when woocommerce state is not available.', () => {
			expect( getTotalProductSearchResults( preInitializedState, 123 ) ).to.eql( 0 );
		} );

		it( 'should be 0 (default) when products are loading.', () => {
			expect( getTotalProductSearchResults( loadingState, 123 ) ).to.eql( 0 );
		} );

		it( 'should be 28, the set total, if the products are loaded.', () => {
			expect( getTotalProductSearchResults( loadedState, 123 ) ).to.eql( 28 );
		} );

		it( 'should be 0 (default) when products are loaded only for a different site.', () => {
			expect( getTotalProductSearchResults( loadedState, 456 ) ).to.eql( 0 );
		} );

		it( 'should get the siteId from the UI tree if not provided.', () => {
			expect( getTotalProductSearchResults( loadedStateWithUi ) ).to.eql( 28 );
		} );
	} );

	describe( '#getProductSearchQuery', () => {
		it( 'should be null (default) when woocommerce state is not available.', () => {
			expect( getProductSearchQuery( preInitializedState, 123 ) ).to.be.null;
		} );

		it( 'should be testing, the set query, when products are loading.', () => {
			expect( getProductSearchQuery( loadingState, 123 ) ).to.eql( 'testing' );
		} );

		it( 'should be testing, the set query, if the products are loaded.', () => {
			expect( getProductSearchQuery( loadedState, 123 ) ).to.eql( 'testing' );
		} );

		it( 'should be null (default) when products are loaded only for a different site.', () => {
			expect( getProductSearchQuery( loadedState, 456 ) ).to.be.null;
		} );

		it( 'should get the siteId from the UI tree if not provided.', () => {
			expect( getProductSearchQuery( loadedStateWithUi ) ).to.eql( 'testing' );
		} );
	} );
} );
