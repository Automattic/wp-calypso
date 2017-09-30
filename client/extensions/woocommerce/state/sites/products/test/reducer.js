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
	productsRequestSuccess,
	productsRequestFailure,
	productsSearchRequest,
	productsSearchRequestFailure,
	productsSearchRequestSuccess,
	productsSearchClear,
} from '../reducer';

import {
	WOOCOMMERCE_PRODUCTS_DELETE_SUCCESS,
	WOOCOMMERCE_PRODUCTS_REQUEST,
	WOOCOMMERCE_PRODUCTS_REQUEST_FAILURE,
	WOOCOMMERCE_PRODUCTS_REQUEST_SUCCESS,
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
			const params = { page: 1, per_page: 10 };
			const action = {
				type: WOOCOMMERCE_PRODUCTS_REQUEST,
				siteId: 123,
				params,
			};
			const newState = productsRequest( undefined, action );
			expect( newState.isLoading ).to.exist;
			expect( newState.isLoading[ JSON.stringify( params ) ] ).to.be.true;
		} );
	} );
	describe( 'productsRequestSuccess', () => {
		it( 'should should show that request is no longer loading', () => {
			const params = { page: 1, per_page: 10 };
			const action = {
				type: WOOCOMMERCE_PRODUCTS_REQUEST_SUCCESS,
				siteId: 123,
				params,
				totalPages: 3,
				products,
			};
			const newState = productsRequestSuccess( { isLoading: { [ JSON.stringify( params ) ]: true } }, action );
			expect( newState.isLoading ).to.exist;
			expect( newState.isLoading[ JSON.stringify( params ) ] ).to.be.false;
		} );
		it( 'should store the products in state', () => {
			const action = {
				type: WOOCOMMERCE_PRODUCTS_REQUEST_SUCCESS,
				siteId: 123,
				params: { page: 1, per_page: 10 },
				totalPages: 3,
				products,
			};
			const newState = productsRequestSuccess( undefined, action );
			expect( newState.products ).to.eql( products );
		} );
		it( 'should add new products onto the existing list', () => {
			const params = { page: 2, per_page: 10 };
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
				isLoading: { [ JSON.stringify( params ) ]: false },
				totalPages: 3,
			};
			const newState = productsRequestSuccess( originalState, action );
			expect( newState.products ).to.eql( [ ...products, ...additionalProducts ] );
		} );
		it( 'should store the total number of pages', () => {
			const action = {
				type: WOOCOMMERCE_PRODUCTS_REQUEST_SUCCESS,
				siteId: 123,
				params: { page: 1, per_page: 10 },
				totalPages: 3,
				products,
			};
			const newState = productsRequestSuccess( undefined, action );
			expect( newState.totalPages ).to.eql( 3 );
		} );
		it( 'should store the total number of products', () => {
			const action = {
				type: WOOCOMMERCE_PRODUCTS_REQUEST_SUCCESS,
				siteId: 123,
				params: { page: 1, per_page: 10 },
				totalPages: 3,
				totalProducts: 30,
				products,
			};
			const newState = productsRequestSuccess( undefined, action );
			expect( newState.totalProducts ).to.eql( 30 );
		} );
	} );
	describe( 'productsRequestFailure', () => {
		it( 'should should show that request has loaded on failure', () => {
			const params = { page: 1, per_page: 10 };
			const action = {
				type: WOOCOMMERCE_PRODUCTS_REQUEST_FAILURE,
				siteId: 123,
				params,
				error: {}
			};

			const newState = productsRequestFailure( { isLoading: { [ JSON.stringify( params ) ]: true } }, action );
			expect( newState.isLoading[ JSON.stringify( params ) ] ).to.be.false;
		} );
	} );
	describe( 'productsSearchRequest', () => {
		it( 'should store the currently loading page', () => {
			const params = { page: 1, per_page: 10 };
			const action = {
				type: WOOCOMMERCE_PRODUCTS_SEARCH_REQUEST,
				siteId: 123,
				params,
				query: 'test',
			};
			const newState = productsSearchRequest( undefined, action );
			expect( newState.search.isLoading ).to.eql( { [ JSON.stringify( params ) ]: true } );
		} );
		it( 'should store the query', () => {
			const action = {
				type: WOOCOMMERCE_PRODUCTS_SEARCH_REQUEST,
				siteId: 123,
				params: { page: 1, per_page: 10 },
				query: 'testing',
			};
			const newState = productsSearchRequest( undefined, action );
			expect( newState.search.query ).to.eql( 'testing' );
		} );
	} );
	describe( 'productsSearchRequestSuccess', () => {
		it( 'should should show that request is no longer loading', () => {
			const params = { page: 1, per_page: 10 };
			const action = {
				type: WOOCOMMERCE_PRODUCTS_SEARCH_REQUEST_SUCCESS,
				siteId: 123,
				products,
				params,
				totalProducts: 28,
				query: 'testing',
			};
			const newState = productsSearchRequestSuccess( {
				search: { isLoading: { [ JSON.stringify( params ) ]: true } }
			}, action );
			expect( newState.search.isLoading[ JSON.stringify( params ) ] ).to.be.false;
		} );
		it( 'should store the products in state', () => {
			const params = { page: 1, per_page: 10 };
			const action = {
				type: WOOCOMMERCE_PRODUCTS_SEARCH_REQUEST_SUCCESS,
				siteId: 123,
				products,
				params,
				totalProducts: 28,
				query: 'testing',
			};
			const newState = productsSearchRequestSuccess( undefined, action );
			expect( newState.products ).to.eql( products );
		} );
		it( 'should add new products onto the existing list', () => {
			const params = { page: 2, per_page: 10 };
			const additionalProducts = [ product ];
			const action = {
				type: WOOCOMMERCE_PRODUCTS_SEARCH_REQUEST_SUCCESS,
				siteId: 123,
				params,
				totalProducts: 28,
				query: 'testing',
				products: additionalProducts,
			};
			const originalState = {
				products,
				search: {
					isLoading: { [ JSON.stringify( { page: 1, per_page: 10 } ) ]: false },
					totalProducts: 28,
				},
			};
			const newState = productsSearchRequestSuccess( originalState, action );
			expect( newState.products ).to.eql( [ ...products, ...additionalProducts ] );
		} );
		it( 'should store the total number of products', () => {
			const params = { page: 1, per_page: 10 };
			const action = {
				type: WOOCOMMERCE_PRODUCTS_SEARCH_REQUEST_SUCCESS,
				siteId: 123,
				params,
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
			const params = { page: 1, per_page: 10 };
			const action = {
				type: WOOCOMMERCE_PRODUCTS_SEARCH_REQUEST_FAILURE,
				siteId: 123,
				params,
				query: 'testing',
				error: {}
			};

			const newState = productsSearchRequestFailure( {
				search: { isLoading: { [ JSON.stringify( params ) ]: true } }
			}, action );
			expect( newState.search.isLoading[ JSON.stringify( params ) ] ).to.be.false;
		} );
	} );
	describe( 'productsSearchClear', () => {
		it( 'should reset search state', () => {
			const action = {
				type: WOOCOMMERCE_PRODUCTS_SEARCH_CLEAR,
				siteId: 123,
			};

			const newState = productsSearchClear( {
				search: { isLoading: { [ JSON.stringify( { page: 1, per_page: 10 } ) ]: true } }
			}, action );
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
