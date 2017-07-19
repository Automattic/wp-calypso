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
	productsSearchRequest,
	productsSearchRequestFailure,
	productsSearchRequestSuccess,
	productsSearchClear,
} from '../reducer';

import {
	WOOCOMMERCE_PRODUCTS_DELETE_SUCCESS,
	WOOCOMMERCE_PRODUCTS_RECEIVE,
	WOOCOMMERCE_PRODUCTS_REQUEST,
	WOOCOMMERCE_PRODUCTS_SEARCH_CLEAR,
	WOOCOMMERCE_PRODUCTS_SEARCH_REQUEST,
	WOOCOMMERCE_PRODUCTS_SEARCH_REQUEST_SUCCESS,
	WOOCOMMERCE_PRODUCTS_SEARCH_REQUEST_FAILURE,
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
				meta: { dataLayer: { doBypass: true } },
			};
			const newState = productsRequest( undefined, action );
			expect( newState.isLoading ).to.eql( { 1: true } );
		} );
	} );
	describe( 'productsReceive', () => {
		it( 'should should show that request is no longer loading', () => {
			const action = {
				type: WOOCOMMERCE_PRODUCTS_RECEIVE,
				siteId: 123,
				page: 1,
				totalPages: 3,
				products,
			};
			const newState = productsReceive( { isLoading: { 1: true } }, action );
			expect( newState.isLoading ).to.eql( { 1: false } );
		} );
		it( 'should store the products in state', () => {
			const action = {
				type: WOOCOMMERCE_PRODUCTS_RECEIVE,
				siteId: 123,
				page: 1,
				totalPages: 3,
				products,
			};
			const newState = productsReceive( undefined, action );
			expect( newState.products ).to.eql( products );
		} );
		it( 'should add new products onto the existing list', () => {
			const additionalProducts = [ product ];
			const action = {
				type: WOOCOMMERCE_PRODUCTS_RECEIVE,
				siteId: 123,
				page: 2,
				totalPages: 3,
				products: additionalProducts,
			};
			const originalState = {
				products,
				isLoading: { 1: false },
				totalPages: 3,
			};
			const newState = productsReceive( originalState, action );
			expect( newState.products ).to.eql( [ ...products, ...additionalProducts ] );
		} );
		it( 'should store the total number of pages', () => {
			const action = {
				type: WOOCOMMERCE_PRODUCTS_RECEIVE,
				siteId: 123,
				page: 1,
				totalPages: 3,
				products,
			};
			const newState = productsReceive( undefined, action );
			expect( newState.totalPages ).to.eql( 3 );
		} );
		it( 'should store the total number of products', () => {
			const action = {
				type: WOOCOMMERCE_PRODUCTS_RECEIVE,
				siteId: 123,
				page: 1,
				totalPages: 3,
				totalProducts: 30,
				products,
			};
			const newState = productsReceive( undefined, action );
			expect( newState.totalProducts ).to.eql( 30 );
		} );
		it( 'should show that request has loaded on failure', () => {
			const action = {
				type: WOOCOMMERCE_PRODUCTS_RECEIVE,
				siteId: 123,
				page: 1,
				error: {}
			};

			const newState = productsReceive( { isLoading: { 1: true } }, action );
			expect( newState.isLoading ).to.eql( { 1: false } );
			expect( newState.isError ).to.eql( { 1: true } );
		} );
	} );
	describe( 'productsSearchRequest', () => {
		it( 'should store the currently loading page', () => {
			const action = {
				type: WOOCOMMERCE_PRODUCTS_SEARCH_REQUEST,
				siteId: 123,
				page: 1,
				query: 'test',
			};
			const newState = productsSearchRequest( undefined, action );
			expect( newState.search.isLoading ).to.eql( { 1: true } );
		} );
		it( 'should store the query', () => {
			const action = {
				type: WOOCOMMERCE_PRODUCTS_SEARCH_REQUEST,
				siteId: 123,
				page: 1,
				query: 'testing',
			};
			const newState = productsSearchRequest( undefined, action );
			expect( newState.search.query ).to.eql( 'testing' );
		} );
	} );
	describe( 'productsSearchRequestSuccess', () => {
		it( 'should should show that request is no longer loading', () => {
			const action = {
				type: WOOCOMMERCE_PRODUCTS_SEARCH_REQUEST_SUCCESS,
				siteId: 123,
				products,
				page: 1,
				totalProducts: 28,
				query: 'testing',
			};
			const newState = productsSearchRequestSuccess( { search: { isLoading: { 1: true } } }, action );
			expect( newState.search.isLoading ).to.eql( { 1: false } );
		} );
		it( 'should store the products in state', () => {
			const action = {
				type: WOOCOMMERCE_PRODUCTS_SEARCH_REQUEST_SUCCESS,
				siteId: 123,
				products,
				page: 1,
				totalProducts: 28,
				query: 'testing',
			};
			const newState = productsSearchRequestSuccess( undefined, action );
			expect( newState.products ).to.eql( products );
		} );
		it( 'should add new products onto the existing list', () => {
			const additionalProducts = [ product ];
			const action = {
				type: WOOCOMMERCE_PRODUCTS_SEARCH_REQUEST_SUCCESS,
				siteId: 123,
				page: 2,
				totalProducts: 28,
				query: 'testing',
				products: additionalProducts,
			};
			const originalState = {
				products,
				search: {
					isLoading: { 1: false },
					totalProducts: 28,
				},
			};
			const newState = productsSearchRequestSuccess( originalState, action );
			expect( newState.products ).to.eql( [ ...products, ...additionalProducts ] );
		} );
		it( 'should store the total number of products', () => {
			const action = {
				type: WOOCOMMERCE_PRODUCTS_SEARCH_REQUEST_SUCCESS,
				siteId: 123,
				page: 1,
				totalProducts: 28,
				query: 'testing',
				products,
			};
			const newState = productsSearchRequestSuccess( undefined, action );
			expect( newState.search.totalProducts ).to.eql( 28 );
		} );
	} );
	describe( 'productsSearchRequestFailure', () => {
		it( 'should should show that request has loaded on failure', () => {
			const action = {
				type: WOOCOMMERCE_PRODUCTS_SEARCH_REQUEST_FAILURE,
				siteId: 123,
				page: 1,
				query: 'testing',
				error: {}
			};

			const newState = productsSearchRequestFailure( { search: { isLoading: { 1: true } } }, action );
			expect( newState.search.isLoading ).to.eql( { 1: false } );
		} );
	} );
	describe( 'productsSearchClear', () => {
		it( 'should reset search state', () => {
			const action = {
				type: WOOCOMMERCE_PRODUCTS_SEARCH_CLEAR,
				siteId: 123,
			};

			const newState = productsSearchClear( { search: { isLoading: { 1: true } } }, action );
			expect( newState.search ).to.eql( {} );
		} );
	} );
	describe( 'productsDeleteSuccess', () => {
		it( 'should remove the product from the products list', () => {
			const action = {
				type: WOOCOMMERCE_PRODUCTS_DELETE_SUCCESS,
				siteId: 123,
				data: product,
			};

			const additionalProducts = [ product ];
			const newState = productsDeleteSuccess( { products: [ ...products, ...additionalProducts ] }, action );
			expect( newState.products ).to.eql( products );
		} );
	} );
} );
