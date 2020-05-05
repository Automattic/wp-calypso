/**
 * External dependencies
 */
import { expect } from 'chai';
import deepFreeze from 'deep-freeze';

/**
 * Internal dependencies
 */
import reducer from '../reducer';
import {
	WOOCOMMERCE_ORDER_UPDATE_SUCCESS,
	WOOCOMMERCE_UI_ORDERS_CLEAR_EDIT,
	WOOCOMMERCE_UI_ORDERS_EDIT,
} from 'woocommerce/state/action-types';

describe( 'reducer', () => {
	test( 'should store the currently editing order', () => {
		const action = {
			type: WOOCOMMERCE_UI_ORDERS_EDIT,
			siteId: 123,
			order: {
				id: 40,
				billing: {
					first_name: 'Joan',
				},
			},
		};
		const newState = reducer( undefined, action );
		expect( newState ).to.eql( {
			currentlyEditingId: 40,
			changes: {
				billing: {
					first_name: 'Joan',
				},
			},
		} );
	} );

	test( "should update the order when it's changed", () => {
		const action = {
			type: WOOCOMMERCE_UI_ORDERS_EDIT,
			siteId: 123,
			order: {
				id: 40,
				billing: {
					first_name: 'Joan',
					last_name: 'Watson',
				},
			},
		};
		const originalState = deepFreeze( {
			currentlyEditingId: 40,
			changes: {
				billing: {
					first_name: 'Joan',
				},
			},
		} );
		const newState = reducer( originalState, action );
		expect( newState ).to.eql( {
			currentlyEditingId: 40,
			changes: {
				billing: {
					first_name: 'Joan',
					last_name: 'Watson',
				},
			},
		} );
	} );

	test( 'should merge updates to an order if new fields are passed in', () => {
		const action = {
			type: WOOCOMMERCE_UI_ORDERS_EDIT,
			siteId: 123,
			order: {
				id: 40,
				billing: {
					last_name: 'Watson',
				},
			},
		};
		const originalState = deepFreeze( {
			currentlyEditingId: 40,
			changes: {
				billing: {
					first_name: 'Joan',
				},
			},
		} );
		const newState = reducer( originalState, action );
		expect( newState ).to.eql( {
			currentlyEditingId: 40,
			changes: {
				billing: {
					first_name: 'Joan',
					last_name: 'Watson',
				},
			},
		} );
	} );

	test( 'should store a generated ID for a created order', () => {
		const action = {
			type: WOOCOMMERCE_UI_ORDERS_EDIT,
			siteId: 123,
			order: {
				billing: {
					first_name: 'Alex',
				},
			},
		};
		const newState = reducer( undefined, action );
		expect( newState.currentlyEditingId.placeholder ).to.exist;
		expect( newState.changes ).to.eql( {
			billing: {
				first_name: 'Alex',
			},
		} );
	} );

	test( 'should merge updates to a new order if additional fields are passed in', () => {
		const action = {
			type: WOOCOMMERCE_UI_ORDERS_EDIT,
			siteId: 123,
			order: {
				id: { placeholder: 'order_1' },
				billing: {
					last_name: 'Helbron',
				},
			},
		};
		const originalState = deepFreeze( {
			currentlyEditingId: { placeholder: 'order_1' },
			changes: {
				billing: {
					first_name: 'Fiona',
				},
			},
		} );
		const newState = reducer( originalState, action );
		expect( newState ).to.eql( {
			currentlyEditingId: { placeholder: 'order_1' },
			changes: {
				billing: {
					first_name: 'Fiona',
					last_name: 'Helbron',
				},
			},
		} );
	} );

	test( 'should clear order changes from the state when requested', () => {
		const action = {
			type: WOOCOMMERCE_UI_ORDERS_CLEAR_EDIT,
			siteId: 123,
		};
		const originalState = deepFreeze( {
			currentlyEditingId: 40,
			changes: {
				billing: {
					first_name: 'Joan',
				},
			},
		} );
		const newState = reducer( originalState, action );
		expect( newState ).to.eql( {
			currentlyEditingId: null,
			changes: {},
		} );
	} );

	test( 'should clear order changes if this order is successfully updated', () => {
		const action = {
			type: WOOCOMMERCE_ORDER_UPDATE_SUCCESS,
			siteId: 123,
			orderId: 40,
			order: {},
		};
		const originalState = deepFreeze( {
			currentlyEditingId: 40,
			changes: {
				billing: {
					first_name: 'Joan',
				},
			},
		} );
		const newState = reducer( originalState, action );
		expect( newState ).to.eql( {
			currentlyEditingId: null,
			changes: {},
		} );
	} );
} );
