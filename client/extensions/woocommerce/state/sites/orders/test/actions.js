/**
 * External dependencies
 */
import { expect } from 'chai';
import { noop } from 'lodash';

/**
 * Internal dependencies
 */
import {
	failOrder,
	failOrders,
	fetchOrder,
	fetchOrders,
	saveOrder,
	saveOrderError,
	saveOrderSuccess,
	updateOrder,
	updateOrders,
} from '../actions';
import order from './fixtures/order';
import orders from './fixtures/orders';
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
			const action = updateOrder( siteId, orderId, order );
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

	describe( '#saveOrder()', () => {
		const siteId = 123;
		const updatedOrder = {
			id: 40,
			status: 'completed',
		};

		test( 'should dispatch an action', () => {
			const action = saveOrder( siteId, updatedOrder, noop, noop );
			expect( action ).to.eql( {
				type: WOOCOMMERCE_ORDER_UPDATE,
				siteId: 123,
				orderId: 40,
				order: { status: 'completed' },
				onFailure: noop,
				onSuccess: noop,
			} );
		} );

		test( 'should dispatch a success action with the order when request completes', () => {
			const action = saveOrderSuccess( siteId, 40, updatedOrder );
			expect( action ).to.eql( {
				type: WOOCOMMERCE_ORDER_UPDATE_SUCCESS,
				siteId: 123,
				orderId: 40,
				order: { id: 40, status: 'completed' },
			} );
		} );

		test( 'should dispatch a failure action with the error when a the request fails', () => {
			const action = saveOrderError( 234, 1, 'Error object' );
			expect( action ).to.eql( {
				type: WOOCOMMERCE_ORDER_UPDATE_FAILURE,
				siteId: 234,
				orderId: 1,
				error: 'Error object',
			} );
		} );
	} );

	describe( '#saveOrder() - new order', () => {
		const siteId = 123;
		const newOrder = {
			id: { placeholder: 'order_1' },
			status: 'processing',
		};

		test( 'should dispatch an action', () => {
			const action = saveOrder( siteId, newOrder, noop, noop );
			expect( action ).to.eql( {
				type: WOOCOMMERCE_ORDER_UPDATE,
				siteId: 123,
				orderId: { placeholder: 'order_1' },
				order: { status: 'processing' },
				onFailure: noop,
				onSuccess: noop,
			} );
		} );

		test( 'should dispatch a success action with the order when request completes', () => {
			const updatedOrder = { ...newOrder, id: 42 };
			const action = saveOrderSuccess( siteId, { placeholder: 'order_1' }, updatedOrder );
			expect( action ).to.eql( {
				type: WOOCOMMERCE_ORDER_UPDATE_SUCCESS,
				siteId: 123,
				orderId: { placeholder: 'order_1' },
				order: { id: 42, status: 'processing' },
			} );
		} );
	} );
} );
