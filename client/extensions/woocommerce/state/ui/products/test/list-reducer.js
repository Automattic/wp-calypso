/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { productsDeleteSuccess, productsRequest, productsRequestSuccess } from '../list-reducer';
import { WOOCOMMERCE_PRODUCTS_DELETE_SUCCESS, WOOCOMMERCE_PRODUCTS_REQUEST, WOOCOMMERCE_PRODUCTS_REQUEST_SUCCESS } from 'woocommerce/state/action-types';
import product from 'woocommerce/state/sites/products/test/fixtures/product';
import products from 'woocommerce/state/sites/products/test/fixtures/products';

describe( 'reducer', () => {
	describe( 'productsRequest', () => {
		it( 'should store the requested page', () => {
			const action = {
				type: WOOCOMMERCE_PRODUCTS_REQUEST,
				siteId: 123,
				page: 3,
			};
			const newState = productsRequest( undefined, action );
			expect( newState.requestedPage ).to.eql( 3 );
		} );
	} );
	describe( 'productsRequestSuccess', () => {
		it( 'should store the current page', () => {
			const action = {
				type: WOOCOMMERCE_PRODUCTS_REQUEST_SUCCESS,
				siteId: 123,
				page: 2,
				totalPages: 3,
				totalProducts: 30,
				products,
			};
			const newState = productsRequestSuccess( undefined, action );
			expect( newState.currentPage ).to.eql( 2 );
		} );
		it( 'should store product ids for the current page', () => {
			const action = {
				type: WOOCOMMERCE_PRODUCTS_REQUEST_SUCCESS,
				siteId: 123,
				page: 2,
				totalPages: 3,
				totalProducts: 30,
				products,
			};
			const newState = productsRequestSuccess( undefined, action );
			expect( newState.productIds ).to.eql( [ 15, 389 ] );
		} );
	} );
	describe( 'productsDeleteSuccess', () => {
		it( 'should remove the product from the products list', () => {
			const action = {
				type: WOOCOMMERCE_PRODUCTS_DELETE_SUCCESS,
				siteId: 123,
				data: product,
			};

			const newState = productsDeleteSuccess( { productIds: [ 31, 15, 389 ] }, action );
			expect( newState.productIds ).to.eql( [ 15, 389 ] );
		} );
	} );
} );
