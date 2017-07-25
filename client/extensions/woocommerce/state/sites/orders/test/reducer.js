/**
 * External dependencies
 */
import { expect } from 'chai';
import deepFreeze from 'deep-freeze';
import { keyBy } from 'lodash';

/**
 * Internal dependencies
 */
import {
	isLoading,
	isQueryLoading,
	isUpdating,
	items,
	queries,
	total,
} from '../reducer';
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

describe( 'reducer', () => {
	describe( 'isLoading', () => {
		it( 'should have no change by default', () => {
			const newState = isLoading( undefined, {} );
			expect( newState ).to.eql( {} );
		} );

		it( 'should store the currently loading order', () => {
			const action = {
				type: WOOCOMMERCE_ORDER_REQUEST,
				siteId: 123,
				orderId: 45,
			};
			const newState = isLoading( undefined, action );
			expect( newState ).to.eql( { 45: true } );
		} );

		it( 'should show that request has loaded on success', () => {
			const action = {
				type: WOOCOMMERCE_ORDER_REQUEST_SUCCESS,
				siteId: 123,
				orderId: 45,
				order,
			};
			const newState = isLoading( { 45: true }, action );
			expect( newState ).to.eql( { 45: false } );
		} );

		it( 'should show that request has loaded on failure', () => {
			const action = {
				type: WOOCOMMERCE_ORDER_REQUEST_FAILURE,
				siteId: 123,
				orderId: 45,
				error: {},
			};
			const newState = isLoading( { 45: true }, action );
			expect( newState ).to.eql( { 45: false } );
		} );
	} );

	describe( 'isQueryLoading', () => {
		it( 'should have no change by default', () => {
			const newState = isQueryLoading( undefined, {} );
			expect( newState ).to.eql( {} );
		} );

		it( 'should store the currently loading page', () => {
			const action = {
				type: WOOCOMMERCE_ORDERS_REQUEST,
				siteId: 123,
				query: {
					page: 1,
				},
			};
			const newState = isQueryLoading( undefined, action );
			expect( newState ).to.eql( { '{}': true } );
		} );

		it( 'should show that request has loaded on success', () => {
			const action = {
				type: WOOCOMMERCE_ORDERS_REQUEST_SUCCESS,
				siteId: 123,
				query: {
					page: 1,
				},
				total: 4,
				orders,
			};
			const newState = isQueryLoading( { '{}': true }, action );
			expect( newState ).to.eql( { '{}': false } );
		} );

		it( 'should show that request has loaded on failure', () => {
			const action = {
				type: WOOCOMMERCE_ORDERS_REQUEST_FAILURE,
				siteId: 123,
				query: {
					page: 1,
				},
				error: {},
			};
			const newState = isQueryLoading( { '{}': true }, action );
			expect( newState ).to.eql( { '{}': false } );
		} );
	} );

	describe( 'isUpdating', () => {
		it( 'should have no change by default', () => {
			const newState = isUpdating( undefined, {} );
			expect( newState ).to.eql( {} );
		} );

		it( 'should store that an order is being updated', () => {
			const action = {
				type: WOOCOMMERCE_ORDER_UPDATE,
				siteId: 123,
				orderId: 45,
			};
			const newState = isUpdating( undefined, action );
			expect( newState ).to.eql( { 45: true } );
		} );

		it( 'should show that an order is done updating after success', () => {
			const action = {
				type: WOOCOMMERCE_ORDER_UPDATE_SUCCESS,
				siteId: 123,
				orderId: 45,
				order,
			};
			const newState = isUpdating( { 45: true }, action );
			expect( newState ).to.eql( { 45: false } );
		} );

		it( 'should show that an order is done updating after failure', () => {
			const action = {
				type: WOOCOMMERCE_ORDER_UPDATE_FAILURE,
				siteId: 123,
				orderId: 45,
				error: {},
			};
			const newState = isUpdating( { 45: true }, action );
			expect( newState ).to.eql( { 45: false } );
		} );
	} );

	describe( 'items', () => {
		it( 'should have no change by default', () => {
			const newState = items( undefined, {} );
			expect( newState ).to.eql( {} );
		} );

		it( 'should store the orders in state', () => {
			const action = {
				type: WOOCOMMERCE_ORDERS_REQUEST_SUCCESS,
				siteId: 123,
				query: {
					page: 1,
				},
				total: 4,
				orders,
			};
			const newState = items( undefined, action );
			const ordersById = keyBy( orders, 'id' );
			expect( newState ).to.eql( ordersById );
		} );

		it( 'should add new orders onto the existing order list', () => {
			const action = {
				type: WOOCOMMERCE_ORDERS_REQUEST_SUCCESS,
				siteId: 123,
				query: {
					page: 2,
				},
				total: 4,
				orders: [ order ],
			};
			const originalState = deepFreeze( keyBy( orders, 'id' ) );
			const newState = items( originalState, action );
			expect( newState ).to.eql( { ...originalState, 40: order } );
		} );

		it( 'should add new single orders onto the existing order list', () => {
			const action = {
				type: WOOCOMMERCE_ORDER_REQUEST_SUCCESS,
				siteId: 123,
				orderId: 40,
				order,
			};
			const originalState = deepFreeze( keyBy( orders, 'id' ) );
			const newState = items( originalState, action );
			expect( newState ).to.eql( { ...originalState, 40: order } );
		} );

		it( 'should do nothing on a failure', () => {
			const action = {
				type: WOOCOMMERCE_ORDERS_REQUEST_FAILURE,
				siteId: 123,
				query: {
					page: 1,
				},
				error: {},
			};
			const originalState = deepFreeze( keyBy( orders, 'id' ) );
			const newState = items( originalState, action );
			expect( newState ).to.eql( originalState );
		} );
	} );

	describe( 'queries', () => {
		it( 'should have no change by default', () => {
			const newState = queries( undefined, {} );
			expect( newState ).to.eql( {} );
		} );

		it( 'should store the order IDs for the requested page', () => {
			const action = {
				type: WOOCOMMERCE_ORDERS_REQUEST_SUCCESS,
				siteId: 123,
				query: {
					page: 1,
				},
				total: 4,
				orders,
			};
			const newState = queries( undefined, action );
			expect( newState ).to.eql( { '{}': [ 35, 26 ] } );
		} );

		it( 'should add the next page of orders as a second list', () => {
			const action = {
				type: WOOCOMMERCE_ORDERS_REQUEST_SUCCESS,
				siteId: 123,
				query: {
					page: 2,
				},
				total: 4,
				orders: [ order ],
			};
			const originalState = deepFreeze( { '{}': [ 35, 26 ] } );
			const newState = queries( originalState, action );
			expect( newState ).to.eql( { ...originalState, '{"page":2}': [ 40 ] } );
		} );

		it( 'should do nothing on a failure', () => {
			const action = {
				type: WOOCOMMERCE_ORDERS_REQUEST_FAILURE,
				siteId: 123,
				query: {
					page: 1,
				},
				error: {},
			};
			const originalState = deepFreeze( { '{}': [ 35, 26 ] } );
			const newState = queries( originalState, action );
			expect( newState ).to.eql( originalState );
		} );
	} );

	describe( 'total', () => {
		it( 'should have no change by default', () => {
			const newState = total( undefined, {} );
			expect( newState ).to.eql( 1 );
		} );

		it( 'should store the total number of orders when a request loads', () => {
			const action = {
				type: WOOCOMMERCE_ORDERS_REQUEST_SUCCESS,
				siteId: 123,
				query: {
					page: 1,
				},
				total: 4,
				orders,
			};
			const newState = total( undefined, action );
			expect( newState ).to.eql( { '{}': 4 } );
		} );

		it( 'should store the total number of orders on a subsequent request load', () => {
			const action = {
				type: WOOCOMMERCE_ORDERS_REQUEST_SUCCESS,
				siteId: 123,
				query: {
					page: 2,
				},
				total: 4,
				orders: [ order ],
			};
			const originalState = deepFreeze( { '{}': 4 } );
			const newState = total( originalState, action );
			expect( newState ).to.eql( { '{}': 4 } );
		} );

		it( 'should do nothing on a failure', () => {
			const action = {
				type: WOOCOMMERCE_ORDERS_REQUEST_FAILURE,
				siteId: 123,
				query: {
					page: 1,
				},
				error: {},
			};
			const originalState = deepFreeze( { '{}': 4 } );
			const newState = total( originalState, action );
			expect( newState ).to.eql( originalState );
		} );
	} );
} );
