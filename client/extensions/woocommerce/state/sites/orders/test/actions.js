/**
 * External dependencies
 */
import { expect } from 'chai';
import { spy } from 'sinon';

/**
 * Internal dependencies
 */
import { fetchOrders } from '../actions';
import useNock from 'test/helpers/use-nock';
import { useSandbox } from 'test/helpers/use-sinon';
import {
	WOOCOMMERCE_ORDERS_REQUEST,
	WOOCOMMERCE_ORDERS_REQUEST_FAILURE,
	WOOCOMMERCE_ORDERS_REQUEST_SUCCESS,
} from 'woocommerce/state/action-types';
import orders from './fixtures/orders';

describe( 'actions', () => {
	describe( '#fetchOrders()', () => {
		const siteId = '123';

		useSandbox();
		useNock( ( nock ) => {
			nock( 'https://public-api.wordpress.com:443' )
				.persist()
				.get( '/rest/v1.1/jetpack-blogs/123/rest-api/' )
				.query( { path: '/wc/v3/orders&page=1&_method=get' } )
				.reply( 200, {
					data: orders,
					pages: 3
				} )
				.get( '/rest/v1.1/jetpack-blogs/234/rest-api/' )
				.query( { path: '/wc/v3/orders&page=1&_method=get' } )
				.reply( 404, {
					error: 'rest_no_route',
					message: 'No route was found matching the URL and request method',
				} );
		} );

		it( 'should dispatch an action', () => {
			const getState = () => ( {} );
			const dispatch = spy();
			fetchOrders( siteId, 1 )( dispatch, getState );
			expect( dispatch ).to.have.been.calledWith( { type: WOOCOMMERCE_ORDERS_REQUEST, siteId, page: 1 } );
		} );

		it( 'should dispatch a success action with orders list when request completes', () => {
			const getState = () => ( {} );
			const dispatch = spy();
			const response = fetchOrders( siteId, 1 )( dispatch, getState );

			return response.then( () => {
				expect( dispatch ).to.have.been.calledWith( {
					type: WOOCOMMERCE_ORDERS_REQUEST_SUCCESS,
					siteId,
					page: 1,
					totalPages: 3,
					orders
				} );
			} );
		} );

		it( 'should dispatch a failure action with the error when a the request fails', () => {
			const getState = () => ( {} );
			const dispatch = spy();
			const response = fetchOrders( 234, 1 )( dispatch, getState );

			return response.then( () => {
				expect( dispatch ).to.have.been.calledWithMatch( {
					type: WOOCOMMERCE_ORDERS_REQUEST_FAILURE,
					siteId: 234,
				} );
			} );
		} );

		it( 'should not dispatch if orders are already loading for this site', () => {
			const getState = () => ( {
				extensions: {
					woocommerce: {
						sites: {
							123: {
								orders: {
									isLoading: {
										1: true,
									},
									items: {},
									pages: {},
									totalPages: 1
								}
							}
						}
					}
				}
			} );
			const dispatch = spy();
			fetchOrders( 123, 1 )( dispatch, getState );
			expect( dispatch ).to.have.not.been.called;
		} );
	} );
} );
