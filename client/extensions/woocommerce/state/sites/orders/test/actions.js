/** @format */

/**
 * External dependencies
 */
import { expect } from 'chai';
import { omit } from 'lodash';
import { spy } from 'sinon';

/**
 * Internal dependencies
 */
import {
	failOrder,
	failOrders,
	fetchOrder,
	fetchOrders,
	_updateOrder,
	updateOrder,
	updateOrders,
} from '../actions';
import order from './fixtures/order';
import orders from './fixtures/orders';
import useNock from 'test/helpers/use-nock';
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

describe( 'actions', () => {
	describe( '#fetchOrders()', () => {
		const siteId = '123';

		test( 'should return an action', () => {
			const action = fetchOrders( siteId, { page: 1, status: 'any' } );
			expect( action ).to.eql( {
				type: WOOCOMMERCE_ORDERS_REQUEST,
				siteId,
				query: {
					per_page: 50,
					search: '',
					page: 1,
					status: 'any',
				},
			} );
		} );

		test( 'should return a success action with orders list when request completes', () => {
			const action = updateOrders( siteId, { page: 1 }, orders, 30 );
			expect( action ).to.eql( {
				type: WOOCOMMERCE_ORDERS_REQUEST_SUCCESS,
				siteId,
				query: {},
				total: 30,
				orders,
			} );
		} );

		test( 'should return a failure action with the error when a the request fails', () => {
			const action = failOrders( 234, { page: 1 } );
			expect( action ).to.eql( {
				type: WOOCOMMERCE_ORDERS_REQUEST_FAILURE,
				siteId: 234,
				query: {},
				error: false,
			} );
		} );
	} );

	describe( '#fetchOrder()', () => {
		const siteId = '123';
		const orderId = '40';

		test( 'should return an action', () => {
			const action = fetchOrder( siteId, orderId );
			expect( action ).to.eql( {
				type: WOOCOMMERCE_ORDER_REQUEST,
				siteId: '123',
				orderId: '40',
			} );
		} );

		test( 'should return a success action with orders list when request completes', () => {
			const action = _updateOrder( siteId, orderId, order );
			expect( action ).to.eql( {
				type: WOOCOMMERCE_ORDER_REQUEST_SUCCESS,
				siteId: '123',
				orderId: '40',
				order,
			} );
		} );

		test( 'should return a failure action with the error when a the request fails', () => {
			const action = failOrder( siteId, orderId, { code: 'rest_no_route' } );
			expect( action ).to.eql( {
				type: WOOCOMMERCE_ORDER_REQUEST_FAILURE,
				siteId: '123',
				orderId: '40',
				error: { code: 'rest_no_route' },
			} );
		} );
	} );

	describe( '#updateOrder()', () => {
		const siteId = '123';
		const updatedOrder = {
			id: 40,
			status: 'completed',
		};

		useNock( nock => {
			nock( 'https://public-api.wordpress.com:443' )
				.persist()
				.post( '/rest/v1.1/jetpack-blogs/123/rest-api/' )
				.query( {
					path: '/wc/v3/orders/40&_method=post',
					json: true,
					body: omit( updatedOrder, 'id' ),
				} )
				.reply( 200, {
					data: order,
				} )
				.post( '/rest/v1.1/jetpack-blogs/234/rest-api/' )
				.query( {
					path: '/wc/v3/orders/invalid&_method=post',
					json: true,
					body: omit( updatedOrder, 'id' ),
				} )
				.reply( 404, {
					data: {
						message: 'No route was found matching the URL and request method',
						error: 'rest_no_route',
					},
				} );
		} );

		test( 'should dispatch an action', () => {
			const getState = () => ( {} );
			const dispatch = spy();
			updateOrder( siteId, updatedOrder )( dispatch, getState );
			expect( dispatch ).to.have.been.calledWith( {
				type: WOOCOMMERCE_ORDER_UPDATE,
				siteId,
				orderId: 40,
			} );
		} );

		test( 'should dispatch a success action with the order when request completes', () => {
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

		test( 'should dispatch a failure action with the error when a the request fails', () => {
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
