/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import {
	productsDeleteSuccess,
	productsRequest,
	productsReceive,
} from '../list-reducer';

import {
	WOOCOMMERCE_PRODUCTS_DELETE_SUCCESS,
	WOOCOMMERCE_PRODUCTS_REQUEST,
	WOOCOMMERCE_PRODUCTS_RECEIVE,
} from 'woocommerce/state/action-types';

import products from 'woocommerce/state/sites/products/test/fixtures/products';
import product from 'woocommerce/state/sites/products/test/fixtures/product';

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
	describe( 'productsReceive', () => {
		it( 'should store the current page', () => {
			const action = {
				type: WOOCOMMERCE_PRODUCTS_RECEIVE,
				siteId: 123,
				page: 2,
				totalPages: 3,
				totalProducts: 30,
				products,
			};
			const newState = productsReceive( undefined, action );
			expect( newState.currentPage ).to.eql( 2 );
		} );
		it( 'should store product ids for the current page', () => {
			const action = {
				type: WOOCOMMERCE_PRODUCTS_RECEIVE,
				siteId: 123,
				page: 2,
				totalPages: 3,
				totalProducts: 30,
				products,
			};
			const newState = productsReceive( undefined, action );
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
