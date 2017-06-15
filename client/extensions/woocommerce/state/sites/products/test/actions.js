/**
 * External dependencies
 */
import { expect } from 'chai';
import { spy } from 'sinon';

/**
 * Internal dependencies
 */
import { fetchProducts } from '../actions';
import useNock from 'test/helpers/use-nock';
import { useSandbox } from 'test/helpers/use-sinon';
import {
	WOOCOMMERCE_PRODUCTS_REQUEST,
	WOOCOMMERCE_PRODUCTS_REQUEST_FAILURE,
	WOOCOMMERCE_PRODUCTS_REQUEST_SUCCESS,
} from 'woocommerce/state/action-types';
import products from './fixtures/products';

describe( 'actions', () => {
	describe( '#fetchProducts()', () => {
		const siteId = '123';

		useSandbox();
		useNock( ( nock ) => {
			nock( 'https://public-api.wordpress.com:443' )
				.persist()
				.get( '/rest/v1.1/jetpack-blogs/123/rest-api/' )
				.query( { path: '/wc/v3/products&page=1&per_page=10&_envelope&_method=get', json: true } )
				.reply( 200, {
					data: {
						body: products,
						headers: { 'X-WP-TotalPages': 3 },
						status: 200,
					}
				} )
				.get( '/rest/v1.1/jetpack-blogs/234/rest-api/' )
				.query( { path: '/wc/v3/products&page=invalid&per_page=10&_envelope&_method=get', json: true } )
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
			fetchProducts( siteId, 1 )( dispatch, getState );
			expect( dispatch ).to.have.been.calledWith( { type: WOOCOMMERCE_PRODUCTS_REQUEST, siteId, page: 1 } );
		} );

		it( 'should dispatch a success action with products list when request completes', () => {
			const getState = () => ( {} );
			const dispatch = spy();
			const response = fetchProducts( siteId, 1 )( dispatch, getState );

			return response.then( () => {
				expect( dispatch ).to.have.been.calledWith( {
					type: WOOCOMMERCE_PRODUCTS_REQUEST_SUCCESS,
					siteId,
					page: 1,
					totalPages: 3,
					products
				} );
			} );
		} );

		it( 'should dispatch a failure action with the error when a the request fails', () => {
			const getState = () => ( {} );
			const dispatch = spy();
			const response = fetchProducts( 234, 'invalid' )( dispatch, getState );

			return response.then( () => {
				expect( dispatch ).to.have.been.calledWithMatch( {
					type: WOOCOMMERCE_PRODUCTS_REQUEST_FAILURE,
					siteId: 234,
				} );
			} );
		} );

		it( 'should not dispatch if products are already loading for this page', () => {
			const getState = () => ( {
				extensions: {
					woocommerce: {
						sites: {
							[ siteId ]: {
								products: {
									isLoading: {
										1: true,
									}
								}
							}
						}
					}
				}
			} );
			const dispatch = spy();
			fetchProducts( siteId, 1 )( dispatch, getState );
			expect( dispatch ).to.not.have.beenCalled;
		} );
	} );
} );
