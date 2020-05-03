/**
 * External dependencies
 */
import { expect } from 'chai';
import deepFreeze from 'deep-freeze';

/**
 * Internal dependencies
 */
import reducer from '../reducer';
import { refunds } from './fixtures/refunds';
import {
	WOOCOMMERCE_ORDER_REFUND_CREATE,
	WOOCOMMERCE_ORDER_REFUND_CREATE_SUCCESS,
	WOOCOMMERCE_ORDER_REFUND_CREATE_FAILURE,
	WOOCOMMERCE_ORDER_REFUNDS_REQUEST,
	WOOCOMMERCE_ORDER_REFUNDS_REQUEST_SUCCESS,
	WOOCOMMERCE_ORDER_REFUNDS_REQUEST_FAILURE,
} from 'woocommerce/state/action-types';

describe( 'reducer', () => {
	test( 'should have no change by default', () => {
		const newState = reducer( undefined, {} );
		expect( newState ).to.eql( {} );
	} );

	describe( 'isSaving', () => {
		test( 'should store the currently refunding order', () => {
			const action = {
				type: WOOCOMMERCE_ORDER_REFUND_CREATE,
				siteId: 123,
				orderId: 42,
			};
			const newState = reducer( undefined, action );
			expect( newState ).to.eql( {
				42: {
					isSaving: true,
					items: [],
				},
			} );
		} );

		test( 'should show that the refund request has finished on success', () => {
			const action = {
				type: WOOCOMMERCE_ORDER_REFUND_CREATE_SUCCESS,
				siteId: 123,
				orderId: 42,
				refund: refunds[ 0 ],
			};
			const newState = reducer(
				{
					42: {
						isSaving: false,
						items: [],
					},
				},
				action
			);
			expect( newState ).to.eql( {
				42: {
					isSaving: false,
					items: [ refunds[ 0 ] ],
				},
			} );
		} );

		test( 'should show that the refund request has finished on failure', () => {
			const action = {
				type: WOOCOMMERCE_ORDER_REFUND_CREATE_FAILURE,
				siteId: 123,
				orderId: 42,
				error: {},
			};
			const originalState = deepFreeze( {
				42: {
					isSaving: true,
					items: [],
				},
			} );
			const newState = reducer( originalState, action );
			expect( newState ).to.eql( {
				42: {
					isSaving: false,
					items: [],
				},
			} );
		} );
	} );

	describe( 'items', () => {
		test( 'should store the currently refunding order', () => {
			const action = {
				type: WOOCOMMERCE_ORDER_REFUNDS_REQUEST,
				siteId: 123,
				orderId: 42,
			};
			const newState = reducer( undefined, action );
			// This is intentionally unset, due to how keyedReducer works
			expect( newState ).to.eql( {} );
		} );

		test( 'should save the requested refunds in the state', () => {
			const action = {
				type: WOOCOMMERCE_ORDER_REFUNDS_REQUEST_SUCCESS,
				siteId: 123,
				orderId: 42,
				refunds,
			};
			// This is intentionally unset, due to how keyedReducer works
			const newState = reducer( {}, action );
			expect( newState ).to.eql( {
				42: {
					isSaving: null,
					items: refunds,
				},
			} );
		} );

		test( 'should do nothing on failure', () => {
			const action = {
				type: WOOCOMMERCE_ORDER_REFUNDS_REQUEST_FAILURE,
				siteId: 123,
				orderId: 42,
				error: {},
			};
			const originalState = deepFreeze( {} );
			const newState = reducer( originalState, action );
			// This is intentionally unset, due to how keyedReducer works
			expect( newState ).to.eql( {} );
		} );

		test( 'should be able to store multiple order refund lists', () => {
			const action = {
				type: WOOCOMMERCE_ORDER_REFUNDS_REQUEST_SUCCESS,
				siteId: 123,
				orderId: 20,
				refunds: [ { id: 1, amount: '25.00' } ],
			};
			const originalState = deepFreeze( {
				42: {
					isSaving: null,
					items: refunds,
				},
			} );
			const newState = reducer( originalState, action );
			expect( newState ).to.eql( {
				42: {
					isSaving: null,
					items: refunds,
				},
				20: {
					isSaving: null,
					items: [ { id: 1, amount: '25.00' } ],
				},
			} );
		} );
	} );
} );
