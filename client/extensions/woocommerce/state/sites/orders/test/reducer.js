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
	items,
	pages,
	totalPages,
} from '../reducer';
import {
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

		it( 'should store the currently loading page', () => {
			const action = {
				type: WOOCOMMERCE_ORDERS_REQUEST,
				siteId: 123,
				page: 1,
			};
			const newState = isLoading( undefined, action );
			expect( newState ).to.eql( { 1: true } );
		} );

		it( 'should should show that request has loaded on success', () => {
			const action = {
				type: WOOCOMMERCE_ORDERS_REQUEST_SUCCESS,
				siteId: 123,
				page: 1,
				totalPages: 4,
				orders
			};
			const newState = isLoading( { 1: true }, action );
			expect( newState ).to.eql( { 1: false } );
		} );

		it( 'should should show that request has loaded on failure', () => {
			const action = {
				type: WOOCOMMERCE_ORDERS_REQUEST_FAILURE,
				siteId: 123,
				page: 1,
				error: {}
			};
			const newState = isLoading( { 1: true }, action );
			expect( newState ).to.eql( { 1: false } );
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
				page: 1,
				totalPages: 4,
				orders
			};
			const newState = items( undefined, action );
			const ordersById = keyBy( orders, 'id' );
			expect( newState ).to.eql( ordersById );
		} );

		it( 'should add new orders onto the existing order list', () => {
			const action = {
				type: WOOCOMMERCE_ORDERS_REQUEST_SUCCESS,
				siteId: 123,
				page: 2,
				totalPages: 4,
				orders: [ order ]
			};
			const originalState = deepFreeze( keyBy( orders, 'id' ) );
			const newState = items( originalState, action );
			expect( newState ).to.eql( { ...originalState, 40: order } );
		} );

		it( 'should do nothing on a failure', () => {
			const action = {
				type: WOOCOMMERCE_ORDERS_REQUEST_FAILURE,
				siteId: 123,
				page: 1,
				error: {}
			};
			const originalState = deepFreeze( keyBy( orders, 'id' ) );
			const newState = items( originalState, action );
			expect( newState ).to.eql( originalState );
		} );
	} );

	describe( 'pages', () => {
		it( 'should have no change by default', () => {
			const newState = pages( undefined, {} );
			expect( newState ).to.eql( {} );
		} );

		it( 'should store the order IDs for the requested page', () => {
			const action = {
				type: WOOCOMMERCE_ORDERS_REQUEST_SUCCESS,
				siteId: 123,
				page: 1,
				totalPages: 4,
				orders
			};
			const newState = pages( undefined, action );
			expect( newState ).to.eql( { 1: [ 35, 26 ] } );
		} );

		it( 'should add the next page of orders as a second list', () => {
			const action = {
				type: WOOCOMMERCE_ORDERS_REQUEST_SUCCESS,
				siteId: 123,
				page: 2,
				totalPages: 4,
				orders: [ order ]
			};
			const originalState = deepFreeze( { 1: [ 35, 26 ] } );
			const newState = pages( originalState, action );
			expect( newState ).to.eql( { ...originalState, 2: [ 40 ] } );
		} );

		it( 'should do nothing on a failure', () => {
			const action = {
				type: WOOCOMMERCE_ORDERS_REQUEST_FAILURE,
				siteId: 123,
				page: 1,
				error: {}
			};
			const originalState = deepFreeze( { 1: [ 35, 26 ] } );
			const newState = pages( originalState, action );
			expect( newState ).to.eql( originalState );
		} );
	} );

	describe( 'totalPages', () => {
		it( 'should have no change by default', () => {
			const newState = totalPages( undefined, {} );
			expect( newState ).to.eql( 1 );
		} );

		it( 'should store the total number of pages when a request loads', () => {
			const action = {
				type: WOOCOMMERCE_ORDERS_REQUEST_SUCCESS,
				siteId: 123,
				page: 1,
				totalPages: 4,
				orders
			};
			const newState = totalPages( undefined, action );
			expect( newState ).to.eql( 4 );
		} );

		it( 'should store the total number of pages even on a subsequent request load', () => {
			const action = {
				type: WOOCOMMERCE_ORDERS_REQUEST_SUCCESS,
				siteId: 123,
				page: 2,
				totalPages: 4,
				orders: [ order ]
			};
			const originalState = deepFreeze( 4 );
			const newState = totalPages( originalState, action );
			expect( newState ).to.eql( 4 );
		} );

		it( 'should do nothing on a failure', () => {
			const action = {
				type: WOOCOMMERCE_ORDERS_REQUEST_FAILURE,
				siteId: 123,
				page: 1,
				error: {}
			};
			const originalState = deepFreeze( 4 );
			const newState = totalPages( originalState, action );
			expect( newState ).to.eql( originalState );
		} );
	} );
} );
