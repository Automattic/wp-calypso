/**
 * External dependencies
 */
import { expect } from 'chai';
import { spy } from 'sinon';
import { omit } from 'lodash';

/**
 * Internal dependencies
 */
import { fetchOrder, fetchOrders, updateOrder } from '../actions';
import useNock from 'test/helpers/use-nock';
import { useSandbox } from 'test/helpers/use-sinon';
import {
	WOOCOMMERCE_ORDER_REQUEST,
	WOOCOMMERCE_ORDER_REQUEST_FAILURE,
	WOOCOMMERCE_ORDER_REQUEST_SUCCESS,
	WOOCOMMERCE_ORDER_UPDATE,
	WOOCOMMERCE_ORDER_UPDATE_FAILURE,
	WOOCOMMERCE_ORDER_UPDATE_SUCCESS,
	WOOCOMMERCE_ORDERS_REQUEST,
	WOOCOMMERCE_ORDERS_REQUEST_FAILURE,
	WOOCOMMERCE_ORDERS_REQUEST_SUCCESS,
} from 'woocommerce/state/action-types';
import orders from './fixtures/orders';
import order from './fixtures/order';

describe( 'actions', () => {
	describe( '#fetchOrders()', () => {
		const siteId = '123';

		useSandbox();
		useNock( ( nock ) => {
			nock( 'https://public-api.wordpress.com:443' )
				.persist()
				.get( '/rest/v1.1/jetpack-blogs/123/rest-api/' )
				.query( { path: '/wc/v3/orders&page=1&per_page=50&status=any&_envelope&_method=get', json: true } )
				.reply( 200, {
					data: {
						body: orders,
						headers: { 'X-WP-TotalPages': 3, 'X-WP-Total': 30 },
						status: 200,
					}
				} )
				.get( '/rest/v1.1/jetpack-blogs/234/rest-api/' )
				.query( { path: '/wc/v3/orders&page=invalid&per_page=50&status=any&_envelope&_method=get', json: true } )
				.reply( 404, {
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
			fetchOrders( siteId, { page: 1, status: 'any' } )( dispatch, getState );
			expect( dispatch ).to.have.been.calledWith( { type: WOOCOMMERCE_ORDERS_REQUEST, siteId, query: {} } );
		} );

		it( 'should dispatch a success action with orders list when request completes', () => {
			const getState = () => ( {} );
			const dispatch = spy();
			const response = fetchOrders( siteId, { page: 1 } )( dispatch, getState );

			return response.then( () => {
				expect( dispatch ).to.have.been.calledWith( {
					type: WOOCOMMERCE_ORDERS_REQUEST_SUCCESS,
					siteId,
					query: {},
					total: 30,
					orders,
				} );
			} );
		} );

		it( 'should dispatch a failure action with the error when a the request fails', () => {
			const getState = () => ( {} );
			const dispatch = spy();
			const response = fetchOrders( 234, { page: 'invalid' } )( dispatch, getState );

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
									isLoading: {},
									isQueryLoading: {
										'{}': true,
									},
									items: {},
									queries: {},
									total: {},
								}
							}
						}
					}
				}
			} );
			const dispatch = spy();
			fetchOrders( 123, { page: 1 } )( dispatch, getState );
			expect( dispatch ).to.have.not.been.called;
		} );
	} );

	describe( '#fetchOrder()', () => {
		const siteId = '123';

		useSandbox();
		useNock( ( nock ) => {
			nock( 'https://public-api.wordpress.com:443' )
				.persist()
				.get( '/rest/v1.1/jetpack-blogs/123/rest-api/' )
				.query( { path: '/wc/v3/orders/40&_method=get', json: true } )
				.reply( 200, {
					data: order,
				} )
				.get( '/rest/v1.1/jetpack-blogs/234/rest-api/' )
				.query( { path: '/wc/v3/orders/invalid&_method=get', json: true } )
				.reply( 404, {
					data: {
						message: 'No route was found matching the URL and request method',
						error: 'rest_no_route',
						status: 400,
					}
				} );
		} );

		it( 'should dispatch an action', () => {
			const getState = () => ( {} );
			const dispatch = spy();
			fetchOrder( siteId, 40 )( dispatch, getState );
			expect( dispatch ).to.have.been.calledWith( { type: WOOCOMMERCE_ORDER_REQUEST, siteId, orderId: 40 } );
		} );

		it( 'should dispatch a success action with the order when request completes', () => {
			const getState = () => ( {} );
			const dispatch = spy();
			const response = fetchOrder( siteId, 40 )( dispatch, getState );

			return response.then( () => {
				expect( dispatch ).to.have.been.calledWith( {
					type: WOOCOMMERCE_ORDER_REQUEST_SUCCESS,
					siteId,
					orderId: 40,
					order,
				} );
			} );
		} );

		it( 'should dispatch a failure action with the error when a the request fails', () => {
			const getState = () => ( {} );
			const dispatch = spy();
			const response = fetchOrder( 234, 'invalid' )( dispatch, getState );

			return response.then( () => {
				expect( dispatch ).to.have.been.calledWithMatch( {
					type: WOOCOMMERCE_ORDER_REQUEST_FAILURE,
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
									isQueryLoading: {},
									isLoading: {
										40: true,
									},
									items: {},
									queries: {},
									total: {},
								}
							}
						}
					}
				}
			} );
			const dispatch = spy();
			fetchOrder( 123, 40 )( dispatch, getState );
			expect( dispatch ).to.not.have.been.called;
		} );
	} );

	describe( '#updateOrder()', () => {
		const siteId = '123';
		const updatedOrder = {
			id: 40,
			status: 'completed',
		};

		useSandbox();
		useNock( ( nock ) => {
			nock( 'https://public-api.wordpress.com:443' )
				.persist()
				.post( '/rest/v1.1/jetpack-blogs/123/rest-api/' )
				.query( { path: '/wc/v3/orders/40&_method=post', json: true, body: omit( updatedOrder, 'id' ) } )
				.reply( 200, {
					data: order,
				} )
				.post( '/rest/v1.1/jetpack-blogs/234/rest-api/' )
				.query( { path: '/wc/v3/orders/invalid&_method=post', json: true, body: omit( updatedOrder, 'id' ) } )
				.reply( 404, {
					data: {
						message: 'No route was found matching the URL and request method',
						error: 'rest_no_route',
					}
				} );
		} );

		it( 'should dispatch an action', () => {
			const getState = () => ( {} );
			const dispatch = spy();
			updateOrder( siteId, updatedOrder )( dispatch, getState );
			expect( dispatch ).to.have.been.calledWith( { type: WOOCOMMERCE_ORDER_UPDATE, siteId, orderId: 40 } );
		} );

		it( 'should dispatch a success action with the order when request completes', () => {
			const getState = () => ( {} );
			const dispatch = spy();
			const response = updateOrder( siteId, updatedOrder )( dispatch, getState );

			return response.then( () => {
				expect( dispatch ).to.have.been.calledWith( {
					type: WOOCOMMERCE_ORDER_UPDATE_SUCCESS,
					siteId,
					orderId: 40,
					order,
				} );
			} );
		} );

		it( 'should dispatch a failure action with the error when a the request fails', () => {
			const getState = () => ( {} );
			const dispatch = spy();
			const response = updateOrder( 234, { id: 'invalid' } )( dispatch, getState );

			return response.then( () => {
				expect( dispatch ).to.have.been.calledWithMatch( {
					type: WOOCOMMERCE_ORDER_UPDATE_FAILURE,
					siteId: 234,
				} );
			} );
		} );
	} );
} );
