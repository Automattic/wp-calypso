/**
 * External dependencies
 */
import { expect } from 'chai';
import deepFreeze from 'deep-freeze';

/**
 * Internal dependencies
 */
import {
	productsDeleteSuccess,
	productsRequest,
	productsRequestSuccess,
	productsRequestFailure,
} from '../reducer';
import product from './fixtures/product';
import products from './fixtures/products';
import {
	WOOCOMMERCE_PRODUCTS_DELETE_SUCCESS,
	WOOCOMMERCE_PRODUCTS_REQUEST,
	WOOCOMMERCE_PRODUCTS_REQUEST_FAILURE,
	WOOCOMMERCE_PRODUCTS_REQUEST_SUCCESS,
} from 'woocommerce/state/action-types';

describe( 'reducer', () => {
	describe( 'productsRequest', () => {
		test( 'should indicate loading the default query', () => {
			const params = { page: 1, per_page: 10 };
			const action = {
				type: WOOCOMMERCE_PRODUCTS_REQUEST,
				siteId: 123,
				params,
			};
			const newState = productsRequest( undefined, action );
			expect( newState.queries ).to.exist;
			expect( newState.queries[ '{}' ].isLoading ).to.be.true;
		} );
		test( 'should indicate loading a search query', () => {
			const action = {
				type: WOOCOMMERCE_PRODUCTS_REQUEST,
				siteId: 123,
				params: { page: 1, per_page: 10, search: 'testing' },
			};
			const newState = productsRequest( undefined, action );
			expect( newState.queries ).to.exist;
			expect( newState.queries[ '{"search":"testing"}' ].isLoading ).to.be.true;
		} );
	} );
	describe( 'productsRequestSuccess', () => {
		test( 'should should show that request is no longer loading', () => {
			const action = {
				type: WOOCOMMERCE_PRODUCTS_REQUEST_SUCCESS,
				siteId: 123,
				params: { page: 1, per_page: 10 },
				totalPages: 3,
				products,
			};
			const newState = productsRequestSuccess( { isLoading: { '{}': true } }, action );
			expect( newState.queries ).to.exist;
			expect( newState.queries[ '{}' ].isLoading ).to.be.false;
		} );
		test( 'should should show that a search request is no longer loading', () => {
			const action = {
				type: WOOCOMMERCE_PRODUCTS_REQUEST_SUCCESS,
				siteId: 123,
				products,
				params: { page: 1, per_page: 10, search: 'testing' },
				totalProducts: 28,
			};
			const originalState = { isLoading: { '{"search":"testing"}': true } };
			const newState = productsRequestSuccess( originalState, action );
			expect( newState.queries ).to.exist;
			expect( newState.queries[ '{"search":"testing"}' ].isLoading ).to.be.false;
		} );

		test( 'should store the products in state', () => {
			const action = {
				type: WOOCOMMERCE_PRODUCTS_REQUEST_SUCCESS,
				siteId: 123,
				params: { page: 1, per_page: 10 },
				totalPages: 3,
				totalProducts: 30,
				products,
			};
			const newState = productsRequestSuccess( undefined, action );
			expect( newState.products ).to.eql( products );
			expect( newState.queries[ '{}' ].ids ).to.eql( [ 15, 389 ] );
		} );
		test( 'should add new products onto the existing list', () => {
			const additionalProducts = [ product ];
			const action = {
				type: WOOCOMMERCE_PRODUCTS_REQUEST_SUCCESS,
				siteId: 123,
				params: { page: 2, per_page: 10 },
				totalPages: 3,
				totalProducts: 30,
				products: additionalProducts,
			};
			const originalState = {
				products,
				isLoading: { '{}': false },
			};
			const newState = productsRequestSuccess( originalState, action );
			expect( newState.products ).to.eql( [ ...products, ...additionalProducts ] );
			expect( newState.queries[ '{"page":2}' ].ids ).to.eql( [ 31 ] );
		} );
		test( 'should store the search result products in state', () => {
			const action = {
				type: WOOCOMMERCE_PRODUCTS_REQUEST_SUCCESS,
				siteId: 123,
				params: { page: 1, per_page: 10, search: 'testing' },
				totalPages: 3,
				totalProducts: 28,
				products,
			};
			const newState = productsRequestSuccess( undefined, action );
			expect( newState.products ).to.eql( products );
			expect( newState.queries[ '{"search":"testing"}' ].ids ).to.eql( [ 15, 389 ] );
		} );
		test( 'should add new search result products onto the existing list', () => {
			const additionalProducts = [ product ];
			const action = {
				type: WOOCOMMERCE_PRODUCTS_REQUEST_SUCCESS,
				siteId: 123,
				params: { page: 2, per_page: 10, search: 'testing' },
				totalPages: 3,
				totalProducts: 28,
				products: additionalProducts,
			};
			const originalState = {
				isLoading: { [ '{"search":"testing"}' ]: false },
				products,
			};
			const newState = productsRequestSuccess( originalState, action );
			expect( newState.products ).to.eql( [ ...products, ...additionalProducts ] );
			expect( newState.queries[ '{"page":2,"search":"testing"}' ].ids ).to.eql( [ 31 ] );
		} );
		test( 'should store the search result products in state alongside other product list queries', () => {
			const action = {
				type: WOOCOMMERCE_PRODUCTS_REQUEST_SUCCESS,
				siteId: 123,
				params: { page: 1, per_page: 10, search: 'testing' },
				totalPages: 3,
				totalProducts: 28,
				products: [ product ],
			};
			const originalState = {
				products,
				queries: {
					'{}': {
						ids: [ 15, 389 ],
					},
				},
			};
			const newState = productsRequestSuccess( originalState, action );
			expect( newState.products ).to.eql( [ ...products, product ] );
			expect( newState.queries[ '{}' ].ids ).to.eql( [ 15, 389 ] );
			expect( newState.queries[ '{"search":"testing"}' ].ids ).to.eql( [ 31 ] );
		} );

		test( 'should store the total number of pages', () => {
			const action = {
				type: WOOCOMMERCE_PRODUCTS_REQUEST_SUCCESS,
				siteId: 123,
				params: { page: 1, per_page: 10 },
				totalPages: 3,
				totalProducts: 30,
				products,
			};
			const newState = productsRequestSuccess( undefined, action );
			expect( newState.queries[ '{}' ].totalPages ).to.eql( 3 );
		} );

		test( 'should store the total number of products', () => {
			const action = {
				type: WOOCOMMERCE_PRODUCTS_REQUEST_SUCCESS,
				siteId: 123,
				params: { page: 1, per_page: 10 },
				totalPages: 3,
				totalProducts: 30,
				products,
			};
			const newState = productsRequestSuccess( undefined, action );
			expect( newState.queries[ '{}' ].totalProducts ).to.eql( 30 );
		} );
		test( 'should store the total number of products on a search result', () => {
			const action = {
				type: WOOCOMMERCE_PRODUCTS_REQUEST_SUCCESS,
				siteId: 123,
				params: { page: 1, per_page: 10, search: 'testing' },
				totalProducts: 28,
				products,
			};
			const newState = productsRequestSuccess( undefined, action );
			expect( newState.queries[ '{"search":"testing"}' ].totalProducts ).to.eql( 28 );
		} );
	} );

	describe( 'productsRequestFailure', () => {
		test( 'should should show that request has finished on failure', () => {
			const params = { page: 1, per_page: 10 };
			const action = {
				type: WOOCOMMERCE_PRODUCTS_REQUEST_FAILURE,
				siteId: 123,
				params,
				error: {},
			};

			const newState = productsRequestFailure( { isLoading: { [ '{}' ]: true } }, action );
			expect( newState.queries[ '{}' ].isLoading ).to.be.false;
		} );
		test( 'should should show that search result request has finished on failure', () => {
			const action = {
				type: WOOCOMMERCE_PRODUCTS_REQUEST_FAILURE,
				siteId: 123,
				params: { page: 1, per_page: 10, search: 'testing' },
				error: {},
			};
			const originalState = { isLoading: { '{"search":"testing"}': true } };
			const newState = productsRequestFailure( originalState, action );
			expect( newState.queries[ '{"search":"testing"}' ].isLoading ).to.be.false;
		} );
	} );

	describe( 'productsDeleteSuccess', () => {
		const originalState = deepFreeze( {
			queries: {
				'{}': {
					isLoading: false,
					ids: [ 15, 31, 389 ],
					totalPages: 1,
					totalProducts: 3,
				},
				'{"search":"example"}': {
					isLoading: false,
					ids: [ 15, 389 ],
					totalPages: 1,
					totalProducts: 2,
				},
			},
			products: [ ...products, product ],
		} );

		test( 'should remove the product from the products list', () => {
			const action = {
				type: WOOCOMMERCE_PRODUCTS_DELETE_SUCCESS,
				siteId: 123,
				data: product,
			};

			const newState = productsDeleteSuccess( originalState, action );
			expect( newState.products ).to.eql( products );
		} );

		test( 'should remove the product from any query results', () => {
			const action = {
				type: WOOCOMMERCE_PRODUCTS_DELETE_SUCCESS,
				siteId: 123,
				data: product,
			};

			const newState = productsDeleteSuccess( originalState, action );
			expect( newState.queries[ '{}' ].ids ).to.eql( [ 15, 389 ] );
		} );

		test( 'should not remove any IDs from unaffected query results', () => {
			const action = {
				type: WOOCOMMERCE_PRODUCTS_DELETE_SUCCESS,
				siteId: 123,
				data: product,
			};

			const newState = productsDeleteSuccess( originalState, action );
			expect( newState.queries[ '{"search":"example"}' ].ids ).to.eql( [ 15, 389 ] );
		} );
	} );
} );
