/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { productsSearchRequest, productsSearchRequestSuccess, productsSearchClear } from '../search-reducer';
import { WOOCOMMERCE_PRODUCTS_SEARCH_REQUEST, WOOCOMMERCE_PRODUCTS_SEARCH_REQUEST_SUCCESS, WOOCOMMERCE_PRODUCTS_SEARCH_CLEAR } from 'woocommerce/state/action-types';
import products from 'woocommerce/state/sites/products/test/fixtures/products';

describe( 'reducer', () => {
	describe( 'productsRequest', () => {
		it( 'should store the requested page', () => {
			const action = {
				type: WOOCOMMERCE_PRODUCTS_SEARCH_REQUEST,
				siteId: 123,
				page: 3,
				query: 'testing',
			};
			const newState = productsSearchRequest( undefined, action );
			expect( newState.requestedPage ).to.eql( 3 );
		} );
	} );
	describe( 'productsRequestSuccess', () => {
		it( 'should store the current page', () => {
			const action = {
				type: WOOCOMMERCE_PRODUCTS_SEARCH_REQUEST_SUCCESS,
				siteId: 123,
				page: 2,
				totalProducts: 28,
				query: 'testing',
				products,
			};
			const newState = productsSearchRequestSuccess( undefined, action );
			expect( newState.currentPage ).to.eql( 2 );
		} );
		it( 'should store product ids for the current page', () => {
			const action = {
				type: WOOCOMMERCE_PRODUCTS_SEARCH_REQUEST_SUCCESS,
				siteId: 123,
				page: 2,
				totalProducts: 28,
				query: 'testing',
				products,
			};
			const newState = productsSearchRequestSuccess( undefined, action );
			expect( newState.productIds ).to.eql( [ 15, 389 ] );
		} );
	} );
	describe( 'productsSearchClear', () => {
		it( 'should reset the search state', () => {
			const action = {
				type: WOOCOMMERCE_PRODUCTS_SEARCH_CLEAR,
				siteId: 123,
			};
			const newState = productsSearchClear( undefined, action );
			expect( newState ).to.eql( {} );
		} );
	} );
} );
