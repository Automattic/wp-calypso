/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import {
	getAllProducts,
	getAllProductsWithVariations,
	getProduct,
	getProducts,
	areProductsLoaded,
	areProductsLoading,
	getTotalProductsPages,
	getTotalProducts,
} from '../selectors';
import products from './fixtures/products';
import productVariations from '../../product-variations/test/fixtures/variations';

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
						queries: {
							'{}': {
								isLoading: true,
							},
							'{"search":"testing"}': {
								isLoading: true,
							},
						},
						products: [],
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
							'{}': false,
							'{"search":"testing"}': false,
						},
						queries: {
							'{}': {
								ids: [ 15, 389 ],
								isLoading: false,
								totalPages: 3,
								totalProducts: 30,
							},
							'{"search":"testing"}': {
								ids: [ 15 ],
								isLoading: false,
								totalPages: 2,
								totalProducts: 16,
							},
						},
						products,
					},
					productVariations,
				},
				401: {
					products: {
						queries: {
							'{}': { isLoading: true },
							'{"search":"testing"}': { isLoading: true },
						},
						products: [],
					},
				},
			},
		},
	},
};

const loadedStateWithUi = { ...loadedState, ui: { selectedSiteId: 123 } };

describe( 'selectors', () => {
	describe( '#getProduct', () => {
		test( 'should give the product object when present.', () => {
			const wooLogo = getProduct( loadedState, 15, 123 );

			expect( wooLogo.id ).to.equal( 15 );
			expect( wooLogo.name ).to.equal( 'Woo Logo' );
		} );

		test( 'should return undefined if the product is not present.', () => {
			const nonexistentId = 250002;
			expect( getProduct( loadedState, nonexistentId, 123 ) ).to.be.undefined;
		} );
	} );

	describe( '#getAllProducts', () => {
		test( 'should get an empty array when woocommerce state is not available.', () => {
			expect( getAllProducts( preInitializedState, 123 ) ).to.eql( [] );
		} );

		test( 'should get an empty array if no products have loaded yet.', () => {
			expect( getAllProducts( loadingState, 123 ) ).to.eql( [] );
		} );

		test( 'should return all loaded products for a given site.', () => {
			expect( getAllProducts( loadedState, 123 ) ).to.eql( products );
		} );
	} );

	describe( '#getAllProductsWithVariations', () => {
		test( 'should get an empty array when woocommerce state is not available.', () => {
			expect( getAllProductsWithVariations( preInitializedState, 123 ) ).to.eql( [] );
		} );

		test( 'should get an empty array if no products have loaded yet.', () => {
			expect( getAllProductsWithVariations( loadingState, 123 ) ).to.eql( [] );
		} );

		test( 'should return all loaded products and variations for a given site.', () => {
			const allProducts = getAllProductsWithVariations( loadedState, 123 );
			expect( allProducts ).to.be.an( 'array' );
			expect( allProducts ).to.include( products[ 1 ] );
			expect( allProducts ).to.deep.include( { ...productVariations[ 15 ][ 0 ], productId: 15 } );
			expect( allProducts.length ).to.eql( 4 );
		} );
	} );

	describe( '#areProductsLoaded', () => {
		const params = { page: 1, per_page: 10 };

		test( 'should be false when woocommerce state is not available.', () => {
			expect( areProductsLoaded( preInitializedState, params, 123 ) ).to.be.false;
		} );

		test( 'should be false when products are currently being fetched.', () => {
			expect( areProductsLoaded( loadingState, params, 123 ) ).to.be.false;
		} );

		test( 'should be true when products are loaded.', () => {
			expect( areProductsLoaded( loadedState, params, 123 ) ).to.be.true;
		} );

		test( 'should be false when products are loaded only for a different site.', () => {
			expect( areProductsLoaded( loadedState, params, 456 ) ).to.be.false;
		} );

		test( 'should be false when a search request is currently being fetched.', () => {
			expect( areProductsLoaded( loadingState, { search: 'testing' }, 123 ) ).to.be.false;
		} );

		test( 'should be true when a search request is loaded.', () => {
			expect( areProductsLoaded( loadedState, { search: 'testing' }, 123 ) ).to.be.true;
		} );

		test( 'should get the siteId from the UI tree if not provided.', () => {
			expect( areProductsLoaded( loadedStateWithUi, params ) ).to.be.true;
		} );
	} );

	describe( '#areProductsLoading', () => {
		const params = { page: 1, per_page: 10 };

		test( 'should be false when woocommerce state is not available.', () => {
			expect( areProductsLoading( preInitializedState, params, 123 ) ).to.be.false;
		} );

		test( 'should be true when products are currently being fetched.', () => {
			expect( areProductsLoading( loadingState, params, 123 ) ).to.be.true;
		} );

		test( 'should be false when products are loaded.', () => {
			expect( areProductsLoading( loadedState, params, 123 ) ).to.be.false;
		} );

		test( 'should be false when products are loaded only for a different site.', () => {
			expect( areProductsLoading( loadedState, params, 456 ) ).to.be.false;
		} );

		test( 'should be true when a search request is currently being fetched.', () => {
			expect( areProductsLoading( loadingState, { search: 'testing' }, 123 ) ).to.be.true;
		} );

		test( 'should be false when a search request is loaded.', () => {
			expect( areProductsLoading( loadedState, { search: 'testing' }, 123 ) ).to.be.false;
		} );

		test( 'should get the siteId from the UI tree if not provided.', () => {
			expect( areProductsLoading( loadedStateWithUi, params ) ).to.be.false;
		} );
	} );

	describe( '#getProducts', () => {
		const params = { page: 1, per_page: 10 };

		test( 'should be an empty array when woocommerce state is not available.', () => {
			expect( getProducts( preInitializedState, params, 123 ) ).to.be.empty;
		} );

		test( 'should be an empty array when product page is loading.', () => {
			expect( getProducts( loadingState, params, 123 ) ).to.be.empty;
		} );

		test( 'should be the list of products if the current page is loaded.', () => {
			expect( getProducts( loadedState, params, 123 ) ).to.eql( products );
		} );

		test( 'should be an empty array when a search request is loading.', () => {
			expect( getProducts( loadingState, { search: 'testing' }, 123 ) ).to.be.empty;
		} );

		test( 'should be the list of products if the search result is loaded.', () => {
			const selectedProducts = getProducts( loadedState, { search: 'testing' }, 123 );
			expect( selectedProducts.length ).to.eql( 1 );
			expect( selectedProducts ).to.eql( [ products[ 0 ] ] );
		} );

		test( 'should be an empty array when products are loaded only for a different site.', () => {
			expect( getProducts( loadedState, params, 456 ) ).to.be.empty;
		} );

		test( 'should get the siteId from the UI tree if not provided.', () => {
			expect( getProducts( loadedStateWithUi, params ) ).to.eql( products );
		} );
	} );

	describe( '#getTotalProductsPages', () => {
		const params = { page: 1, per_page: 10 };

		test( 'should be 0 (default) when woocommerce state is not available.', () => {
			expect( getTotalProductsPages( preInitializedState, params, 123 ) ).to.eql( 0 );
		} );

		test( 'should be 0 (default) when products are loading.', () => {
			expect( getTotalProductsPages( loadingState, params, 123 ) ).to.eql( 0 );
		} );

		test( 'should be 3, the set page total, if the products are loaded.', () => {
			expect( getTotalProductsPages( loadedState, params, 123 ) ).to.eql( 3 );
		} );

		test( 'should be 0 (default) when products are loaded only for a different site.', () => {
			expect( getTotalProductsPages( loadedState, params, 456 ) ).to.eql( 0 );
		} );

		test( 'should get the siteId from the UI tree if not provided.', () => {
			expect( getTotalProductsPages( loadedStateWithUi, params ) ).to.eql( 3 );
		} );
	} );

	describe( '#getTotalProducts', () => {
		const params = { page: 1, per_page: 10 };

		test( 'should be 0 (default) when woocommerce state is not available.', () => {
			expect( getTotalProducts( preInitializedState, params, 123 ) ).to.eql( 0 );
		} );

		test( 'should be 0 (default) when products are loading.', () => {
			expect( getTotalProducts( loadingState, params, 123 ) ).to.eql( 0 );
		} );

		test( 'should be 30, the set products total, if the products are loaded.', () => {
			expect( getTotalProducts( loadedState, params, 123 ) ).to.eql( 30 );
		} );

		test( 'should be 0 (default) when products are loaded only for a different site.', () => {
			expect( getTotalProducts( loadedState, params, 456 ) ).to.eql( 0 );
		} );

		test( 'should get the siteId from the UI tree if not provided.', () => {
			expect( getTotalProducts( loadedStateWithUi, params ) ).to.eql( 30 );
		} );
	} );
} );
