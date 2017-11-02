/** @format */

/**
 * External dependencies
 */
import { expect } from 'chai';
import { spy } from 'sinon';

/**
 * Internal dependencies
 */
import { fetchProducts, deleteProduct } from '../actions';
import product from './fixtures/product';
import products from './fixtures/products';
import useNock from 'test/helpers/use-nock';
import {
	WOOCOMMERCE_ERROR_SET,
	WOOCOMMERCE_PRODUCT_DELETE,
	WOOCOMMERCE_PRODUCT_DELETE_SUCCESS,
	WOOCOMMERCE_PRODUCTS_REQUEST,
	WOOCOMMERCE_PRODUCTS_REQUEST_FAILURE,
	WOOCOMMERCE_PRODUCTS_REQUEST_SUCCESS,
} from 'woocommerce/state/action-types';

describe( 'actions', () => {
	describe( '#fetchProducts()', () => {
		const siteId = '123';

		useNock( nock => {
			nock( 'https://public-api.wordpress.com:443' )
				.persist()
				.get( '/rest/v1.1/jetpack-blogs/123/rest-api/' )
				.query( { path: '/wc/v3/products&page=1&per_page=10&_envelope&_method=get', json: true } )
				.reply( 200, {
					data: {
						body: products,
						headers: { 'X-WP-TotalPages': 3, 'X-WP-Total': 30 },
						status: 200,
					},
				} )
				.get( '/rest/v1.1/jetpack-blogs/234/rest-api/' )
				.query( {
					path: '/wc/v3/products&page=invalid&per_page=10&_envelope&_method=get',
					json: true,
				} )
				.reply( 200, {
					data: {
						message: 'Invalid parameter(s): page',
						error: 'rest_invalid_param',
						status: 400,
					},
				} )
				.get( '/rest/v1.1/jetpack-blogs/123/rest-api/' )
				.query( {
					path: '/wc/v3/products&page=1&per_page=10&search=testing&_envelope&_method=get',
					json: true,
				} )
				.reply( 200, {
					data: {
						body: products,
						headers: { 'X-WP-TotalPages': 3, 'X-WP-Total': 28 },
						status: 200,
					},
				} )
				.get( '/rest/v1.1/jetpack-blogs/123/rest-api/' )
				.query( {
					path: '/wc/v3/products&page=2&per_page=10&search=testing&_envelope&_method=get',
					json: true,
				} )
				.reply( 200, {
					data: {
						body: [ product ],
						headers: { 'X-WP-TotalPages': 3, 'X-WP-Total': 28 },
						status: 200,
					},
				} )
				.get( '/rest/v1.1/jetpack-blogs/234/rest-api/' )
				.query( {
					path: '/wc/v3/products&page=invalid&per_page=10&search=testing&_envelope&_method=get',
					json: true,
				} )
				.reply( 200, {
					data: {
						message: 'Invalid parameter(s): page',
						error: 'rest_invalid_param',
						status: 400,
					},
				} );
		} );

		test( 'should dispatch an action for the default product list', () => {
			const getState = () => ( {} );
			const dispatch = spy();
			fetchProducts( siteId, { page: 1 } )( dispatch, getState );
			expect( dispatch ).to.have.been.calledWith( {
				type: WOOCOMMERCE_PRODUCTS_REQUEST,
				siteId,
				params: {},
			} );
		} );

		test( 'should dispatch a success action with products list when request completes', () => {
			const getState = () => ( {} );
			const dispatch = spy();
			const response = fetchProducts( siteId, { page: 1 } )( dispatch, getState );

			return response.then( () => {
				expect( dispatch ).to.have.been.calledWith( {
					type: WOOCOMMERCE_PRODUCTS_REQUEST_SUCCESS,
					siteId,
					params: {},
					totalPages: 3,
					totalProducts: 30,
					products,
				} );
			} );
		} );

		test( 'should dispatch a failure action with the error when a the request fails', () => {
			const getState = () => ( {} );
			const dispatch = spy();
			const response = fetchProducts( 234, { page: 'invalid' } )( dispatch, getState );

			return response.then( () => {
				expect( dispatch ).to.have.been.calledWithMatch( {
					type: WOOCOMMERCE_PRODUCTS_REQUEST_FAILURE,
					siteId: 234,
				} );
			} );
		} );

		test( 'should not dispatch if products are already loading for this page', () => {
			const getState = () => ( {
				extensions: {
					woocommerce: {
						sites: {
							[ siteId ]: {
								products: {
									isLoading: {
										'{}': true,
									},
								},
							},
						},
					},
				},
			} );
			const dispatch = spy();
			fetchProducts( siteId, { page: 1 } )( dispatch, getState );
			expect( dispatch ).to.not.have.beenCalled;
		} );

		test( 'should dispatch a success action with search results when request completes', () => {
			const getState = () => ( {} );
			const dispatch = spy();
			const response = fetchProducts( siteId, { search: 'testing' } )( dispatch, getState );

			return response.then( () => {
				expect( dispatch ).to.have.been.calledWith( {
					type: WOOCOMMERCE_PRODUCTS_REQUEST_SUCCESS,
					siteId,
					params: { search: 'testing' },
					totalPages: 3,
					totalProducts: 28,
					products,
				} );
			} );
		} );

		test( 'should dispatch a failure action with the error when the search request fails', () => {
			const getState = () => ( {} );
			const dispatch = spy();
			const response = fetchProducts( 234, { page: 'invalid', search: 'testing' } )(
				dispatch,
				getState
			);

			return response.then( () => {
				expect( dispatch ).to.have.been.calledWithMatch( {
					type: WOOCOMMERCE_PRODUCTS_REQUEST_FAILURE,
					siteId: 234,
				} );
			} );
		} );

		test( 'should not dispatch if a search query is already loading for this term', () => {
			const getState = () => ( {
				extensions: {
					woocommerce: {
						sites: {
							[ siteId ]: {
								products: {
									isLoading: {
										'{"search":"testing"}': true,
									},
								},
							},
						},
					},
				},
			} );
			const dispatch = spy();
			fetchProducts( siteId, { search: 'testing' } )( dispatch, getState );
			expect( dispatch ).to.not.have.beenCalled;
		} );

		// @todo Need to revisit this use case
		// test( 'should get query from state if no new query is passed', () => {} );
	} );

	describe( '#deleteProduct()', () => {
		const siteId = '123';

		useNock( nock => {
			nock( 'https://public-api.wordpress.com:443' )
				.persist()
				.post( '/rest/v1.1/jetpack-blogs/123/rest-api/' )
				.query( { path: '/wc/v3/products/523&_method=delete', json: true } )
				.reply( 200, {
					data: product,
				} );
		} );

		test( 'should dispatch an action', () => {
			const getState = () => ( {} );
			const dispatch = spy();
			deleteProduct( siteId, 1 )( dispatch, getState );
			expect( dispatch ).to.have.been.calledWith( {
				type: WOOCOMMERCE_PRODUCT_DELETE,
				siteId,
				productId: 1,
			} );
		} );

		test( 'should dispatch a success action with deleted product data when request completes', () => {
			const getState = () => ( {} );
			const dispatch = spy();
			const response = deleteProduct( siteId, 523 )( dispatch, getState );

			return response.then( () => {
				expect( dispatch ).to.have.been.calledWith( {
					type: WOOCOMMERCE_PRODUCT_DELETE_SUCCESS,
					siteId,
					data: product,
				} );
			} );
		} );
		test( 'should dispatch an error when the request fails', () => {
			const getState = () => ( {} );
			const dispatch = spy();
			const response = deleteProduct( 234, 511 )( dispatch, getState );

			return response.then( () => {
				expect( dispatch ).to.have.been.calledWithMatch( { type: WOOCOMMERCE_ERROR_SET } );
			} );
		} );
	} );
} );
