/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import {
	productsRequest,
	productsRequestSuccess,
	productsRequestFailure,
} from '../reducer';

import {
	WOOCOMMERCE_PRODUCTS_REQUEST,
	WOOCOMMERCE_PRODUCTS_REQUEST_FAILURE,
	WOOCOMMERCE_PRODUCTS_REQUEST_SUCCESS,
} from 'woocommerce/state/action-types';

import products from './fixtures/products';
import product from './fixtures/product';

describe( 'reducer', () => {
	describe( 'productsRequest', () => {
		it( 'should store the currently loading page', () => {
			const action = {
				type: WOOCOMMERCE_PRODUCTS_REQUEST,
				siteId: 123,
				page: 1,
			};
			const newState = productsRequest( undefined, action );
			expect( newState.isLoading ).to.eql( { 1: true } );
		} );
	} );
	describe( 'productsRequestSuccess', () => {
		it( 'should should show that request is no longer loading', () => {
			const action = {
				type: WOOCOMMERCE_PRODUCTS_REQUEST_SUCCESS,
				siteId: 123,
				page: 1,
				totalPages: 3,
				products,
			};
			const newState = productsRequestSuccess( { isLoading: { 1: true } }, action );
			expect( newState.isLoading ).to.eql( { 1: false } );
		} );
		it( 'should store the products in state', () => {
			const action = {
				type: WOOCOMMERCE_PRODUCTS_REQUEST_SUCCESS,
				siteId: 123,
				page: 1,
				totalPages: 3,
				products,
			};
			const newState = productsRequestSuccess( undefined, action );
			expect( newState.products ).to.eql( products );
		} );
		it( 'should add new products onto the existing list', () => {
			const additionalProducts = [ product ];
			const action = {
				type: WOOCOMMERCE_PRODUCTS_REQUEST_SUCCESS,
				siteId: 123,
				page: 2,
				totalPages: 3,
				products: additionalProducts,
			};
			const originalState = {
				products,
				pages: { 1: [ 15, 389 ] },
				isLoading: { 1: false },
				totalPages: 3,
			};
			const newState = productsRequestSuccess( originalState, action );
			expect( newState.products ).to.eql( [ ...products, ...additionalProducts ] );
		} );
		it( 'should store the product IDs for the requested page', () => {
			const action = {
				type: WOOCOMMERCE_PRODUCTS_REQUEST_SUCCESS,
				siteId: 123,
				page: 1,
				totalPages: 3,
				products,
			};
			const newState = productsRequestSuccess( undefined, action );
			expect( newState.pages ).to.eql( { 1: [ 15, 389 ] } );
		} );
		it( 'should add the next page of products as a second list', () => {
			const additionalProducts = [ product ];
			const action = {
				type: WOOCOMMERCE_PRODUCTS_REQUEST_SUCCESS,
				siteId: 123,
				page: 2,
				totalPages: 3,
				products: additionalProducts,
			};
			const originalState = {
				products,
				pages: { 1: [ 15, 389 ] },
				isLoading: { 1: false, 2: true },
				totalPages: 3,
			};
			const newState = productsRequestSuccess( originalState, action );
			expect( newState.pages ).to.eql( {
				1: [ 15, 389 ],
				2: [ 31 ]
			} );
		} );
		it( 'should store the total number of pages', () => {
			const action = {
				type: WOOCOMMERCE_PRODUCTS_REQUEST_SUCCESS,
				siteId: 123,
				page: 1,
				totalPages: 3,
				products,
			};
			const newState = productsRequestSuccess( undefined, action );
			expect( newState.totalPages ).to.eql( 3 );
		} );
	} );
	describe( 'productsRequestFailure', () => {
		it( 'should should show that request has loaded on failure', () => {
			const action = {
				type: WOOCOMMERCE_PRODUCTS_REQUEST_FAILURE,
				siteId: 123,
				page: 1,
				error: {}
			};

			const newState = productsRequestFailure( { isLoading: { 1: true } }, action );
			expect( newState.isLoading ).to.eql( { 1: false } );
		} );
	} );
} );
