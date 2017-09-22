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
							[ JSON.stringify( { page: 1, per_page: 10 } ) ]: true,
						},
						search: {
							isLoading: {
								[ JSON.stringify( { page: 1, per_page: 10 } ) ]: true,
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
								[ JSON.stringify( { page: 1, per_page: 10 } ) ]: false,
							},
							totalProducts: 28,
							query: 'testing',
						},
						isLoading: {
							[ JSON.stringify( { page: 1, per_page: 10 } ) ]: false,
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
								[ JSON.stringify( { page: 1, per_page: 10 } ) ]: true,
							}
						},
						isLoading: {
							[ JSON.stringify( { page: 1, per_page: 10 } ) ]: true,
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
		const params = { page: 1, per_page: 10 };

		it( 'should be false when woocommerce state is not available.', () => {
			expect( areProductsLoaded( preInitializedState, params, 123 ) ).to.be.false;
		} );

		it( 'should be false when products are currently being fetched.', () => {
			expect( areProductsLoaded( loadingState, params, 123 ) ).to.be.false;
		} );

		it( 'should be true when products are loaded.', () => {
			expect( areProductsLoaded( loadedState, params, 123 ) ).to.be.true;
		} );

		it( 'should be false when products are loaded only for a different site.', () => {
			expect( areProductsLoaded( loadedState, params, 456 ) ).to.be.false;
		} );

		it( 'should get the siteId from the UI tree if not provided.', () => {
			expect( areProductsLoaded( loadedStateWithUi, params ) ).to.be.true;
		} );
	} );

	describe( '#areProductsLoading', () => {
		const params = { page: 1, per_page: 10 };

		it( 'should be false when woocommerce state is not available.', () => {
			expect( areProductsLoading( preInitializedState, params, 123 ) ).to.be.false;
		} );

		it( 'should be true when products are currently being fetched.', () => {
			expect( areProductsLoading( loadingState, params, 123 ) ).to.be.true;
		} );

		it( 'should be false when products are loaded.', () => {
			expect( areProductsLoading( loadedState, params, 123 ) ).to.be.false;
		} );

		it( 'should be false when products are loaded only for a different site.', () => {
			expect( areProductsLoading( loadedState, params, 456 ) ).to.be.false;
		} );

		it( 'should get the siteId from the UI tree if not provided.', () => {
			expect( areProductsLoading( loadedStateWithUi, params ) ).to.be.false;
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
		const params = { page: 1, per_page: 10 };

		it( 'should be false when woocommerce state is not available.', () => {
			expect( areProductSearchResultsLoaded( preInitializedState, params, 123 ) ).to.be.false;
		} );

		it( 'should be false when products are currently being fetched.', () => {
			expect( areProductSearchResultsLoaded( loadingState, params, 123 ) ).to.be.false;
		} );

		it( 'should be true when products are loaded.', () => {
			expect( areProductSearchResultsLoaded( loadedState, params, 123 ) ).to.be.true;
		} );

		it( 'should be false when products are loaded only for a different site.', () => {
			expect( areProductSearchResultsLoaded( loadedState, params, 456 ) ).to.be.false;
		} );

		it( 'should get the siteId from the UI tree if not provided.', () => {
			expect( areProductSearchResultsLoaded( loadedStateWithUi, params ) ).to.be.true;
		} );
	} );

	describe( '#areProductSearchResultsLoading', () => {
		const params = { page: 1, per_page: 10 };

		it( 'should be false when woocommerce state is not available.', () => {
			expect( areProductSearchResultsLoading( preInitializedState, params, 123 ) ).to.be.false;
		} );

		it( 'should be true when products are currently being fetched.', () => {
			expect( areProductSearchResultsLoading( loadingState, params, 123 ) ).to.be.true;
		} );

		it( 'should be false when products are loaded.', () => {
			expect( areProductSearchResultsLoading( loadedState, params, 123 ) ).to.be.false;
		} );

		it( 'should be false when products are loaded only for a different site.', () => {
			expect( areProductSearchResultsLoading( loadedState, params, 456 ) ).to.be.false;
		} );

		it( 'should get the siteId from the UI tree if not provided.', () => {
			expect( areProductSearchResultsLoading( loadedStateWithUi, params ) ).to.be.false;
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
