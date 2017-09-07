/**
 * External dependencies
 */
import { expect } from 'chai';
import { spy } from 'sinon';

/**
 * Internal dependencies
 */
import { fetchProducts, fetchProductSearchResults, clearProductSearch, deleteProduct } from '../actions';
import useNock from 'test/helpers/use-nock';
import { useSandbox } from 'test/helpers/use-sinon';
import {
	WOOCOMMERCE_ERROR_SET,
	WOOCOMMERCE_PRODUCT_DELETE,
	WOOCOMMERCE_PRODUCT_DELETE_SUCCESS,
	WOOCOMMERCE_PRODUCTS_REQUEST,
	WOOCOMMERCE_PRODUCTS_SEARCH_CLEAR,
	WOOCOMMERCE_PRODUCTS_SEARCH_REQUEST,
	WOOCOMMERCE_PRODUCTS_SEARCH_REQUEST_SUCCESS,
	WOOCOMMERCE_PRODUCTS_SEARCH_REQUEST_FAILURE,
} from 'woocommerce/state/action-types';
import products from './fixtures/products';
import product from './fixtures/product';

describe( 'actions', () => {
	describe( '#fetchProducts()', () => {
		const siteId = '123';
		it( 'should return an action', () => {
			const action = fetchProducts( siteId, 1 );
			expect( action ).to.eql( { type: WOOCOMMERCE_PRODUCTS_REQUEST, siteId, page: 1 } );
		} );
	} );
	describe( '#fetchProductSearchResults()', () => {
		const siteId = '123';

		useSandbox();
		useNock( ( nock ) => {
			nock( 'https://public-api.wordpress.com:443' )
				.persist()
				.get( '/rest/v1.1/jetpack-blogs/123/rest-api/' )
				.query( { path: '/wc/v3/products&page=1&per_page=10&search=testing&_envelope&_method=get', json: true } )
				.reply( 200, {
					data: {
						body: products,
						headers: { 'X-WP-Total': 28 },
						status: 200,
					}
				} )
				.get( '/rest/v1.1/jetpack-blogs/123/rest-api/' )
				.query( { path: '/wc/v3/products&page=2&per_page=10&search=testing&_envelope&_method=get', json: true } )
				.reply( 200, {
					data: {
						body: [ product ],
						headers: { 'X-WP-Total': 28 },
						status: 200,
					}
				} )
				.get( '/rest/v1.1/jetpack-blogs/234/rest-api/' )
				.query( { path: '/wc/v3/products&page=invalid&per_page=10&search=testing&_envelope&_method=get', json: true } )
				.reply( 200, {
					data: {
						message: 'Invalid parameter(s): page',
						error: 'rest_invalid_param',
						status: 400,
					}
				} );
		} );

		it( 'should dispatch an action', () => {
			const getState = () => ( {} );
			const dispatch = spy();
			fetchProductSearchResults( siteId, 1, 'testing' )( dispatch, getState );
			expect( dispatch ).to.have.been.calledWith( {
				type: WOOCOMMERCE_PRODUCTS_SEARCH_REQUEST,
				siteId,
				page: 1,
				query: 'testing',
			} );
		} );

		it( 'should dispatch a success action with results when request completes', () => {
			const getState = () => ( {} );
			const dispatch = spy();
			const response = fetchProductSearchResults( siteId, 1, 'testing' )( dispatch, getState );

			return response.then( () => {
				expect( dispatch ).to.have.been.calledWith( {
					type: WOOCOMMERCE_PRODUCTS_SEARCH_REQUEST_SUCCESS,
					siteId,
					page: 1,
					totalProducts: 28,
					products,
					query: 'testing',
				} );
			} );
		} );

		it( 'should dispatch a failure action with the error when a the request fails', () => {
			const getState = () => ( {} );
			const dispatch = spy();
			const response = fetchProductSearchResults( 234, 'invalid', 'testing' )( dispatch, getState );

			return response.then( () => {
				expect( dispatch ).to.have.been.calledWithMatch( {
					type: WOOCOMMERCE_PRODUCTS_SEARCH_REQUEST_FAILURE,
					siteId: 234,
				} );
			} );
		} );

		it( 'should not dispatch if results are already loading for this page', () => {
			const getState = () => ( {
				extensions: {
					woocommerce: {
						sites: {
							[ siteId ]: {
								products: {
									search: {
										isLoading: {
											1: true,
										}
									}
								}
							}
						}
					}
				}
			} );
			const dispatch = spy();
			fetchProductSearchResults( siteId, 1, 'testing' )( dispatch, getState );
			expect( dispatch ).to.not.have.beenCalled;
		} );

		it( 'should get query from state if no new query is passed', () => {
			const getState = () => ( {
				extensions: {
					woocommerce: {
						sites: {
							[ siteId ]: {
								products: {
									search: {
										isLoading: {
											1: false,
										},
										query: 'testing',
										totalProducts: 28,
									}
								}
							}
						}
					}
				}
			} );
			const dispatch = spy();
			const response = fetchProductSearchResults( siteId, 2 )( dispatch, getState );
			return response.then( () => {
				expect( dispatch ).to.have.been.calledWith( {
					type: WOOCOMMERCE_PRODUCTS_SEARCH_REQUEST_SUCCESS,
					siteId,
					page: 2,
					totalProducts: 28,
					products: [ product ],
					query: 'testing',
				} );
			} );
		} );
	} );
	describe( '#clearProductSearch()', () => {
		const siteId = '123';
		it( 'should dispatch an action', () => {
			const dispatch = spy();
			dispatch( clearProductSearch( siteId ) );
			expect( dispatch ).to.have.been.calledWith( {
				type: WOOCOMMERCE_PRODUCTS_SEARCH_CLEAR,
				siteId,
			} );
		} );
	} );
	describe( '#deleteProduct()', () => {
		const siteId = '123';

		useSandbox();
		useNock( ( nock ) => {
			nock( 'https://public-api.wordpress.com:443' )
				.persist()
				.post( '/rest/v1.1/jetpack-blogs/123/rest-api/' )
				.query( { path: '/wc/v3/products/523&_method=delete', json: true } )
				.reply( 200, {
					data: product,
				} );
		} );

		it( 'should dispatch an action', () => {
			const getState = () => ( {} );
			const dispatch = spy();
			deleteProduct( siteId, 1 )( dispatch, getState );
			expect( dispatch ).to.have.been.calledWith( {
				type: WOOCOMMERCE_PRODUCT_DELETE,
				siteId,
				productId: 1,
			} );
		} );

		it( 'should dispatch a success action with deleted product data when request completes', () => {
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
		it( 'should dispatch an error when the request fails', () => {
			const getState = () => ( {} );
			const dispatch = spy();
			const response = deleteProduct( 234, 511 )( dispatch, getState );

			return response.then( () => {
				expect( dispatch ).to.have.been.calledWithMatch( { type: WOOCOMMERCE_ERROR_SET } );
			} );
		} );
	} );
} );
