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
	WOOCOMMERCE_UI_ORDERS_CLEAR,
	WOOCOMMERCE_UI_ORDERS_EDIT,
} from 'woocommerce/state/action-types';

describe( 'reducer', () => {
	it( 'should store the currently editing order', () => {
		const action = {
			type: WOOCOMMERCE_UI_ORDERS_EDIT,
			siteId: 123,
			order: {
				id: 40,
				first_name: 'Joan',
			},
		};
		const newState = reducer( undefined, action );
		expect( newState ).to.eql( {
			currentlyEditingId: 40,
			changes: {
				first_name: 'Joan',
			},
		} );
	} );

	it( 'should update the order when it\'s changed', () => {
		const action = {
			type: WOOCOMMERCE_UI_ORDERS_EDIT,
			siteId: 123,
			order: {
				id: 40,
				first_name: 'Joan',
				last_name: 'Watson',
			},
		};
		const originalState = deepFreeze( {
			currentlyEditingId: 40,
			changes: {
				first_name: 'Joan',
			},
		} );
		const newState = reducer( originalState, action );
		expect( newState ).to.eql( {
			currentlyEditingId: 40,
			changes: {
				first_name: 'Joan',
				last_name: 'Watson',
			},
		} );
	} );

	it( 'should merge updates to an order if new fields are passed in', () => {
		const action = {
			type: WOOCOMMERCE_UI_ORDERS_EDIT,
			siteId: 123,
			order: {
				id: 40,
				last_name: 'Watson',
			},
		};
		const originalState = deepFreeze( {
			currentlyEditingId: 40,
			changes: {
				first_name: 'Joan',
			},
		} );
		const newState = reducer( originalState, action );
		expect( newState ).to.eql( {
			currentlyEditingId: 40,
			changes: {
				first_name: 'Joan',
				last_name: 'Watson',
			},
		} );
	} );

	it( 'should change out the order when a new order is edited', () => {
		const action = {
			type: WOOCOMMERCE_UI_ORDERS_EDIT,
			siteId: 123,
			order: {
				id: 42,
				first_name: 'Fiona',
			},
		};
		const originalState = deepFreeze( {
			currentlyEditingId: 40,
			changes: {
				first_name: 'Joan',
			},
		} );
		const newState = reducer( originalState, action );
		expect( newState ).to.eql( {
			currentlyEditingId: 42,
			changes: {
				first_name: 'Fiona',
			},
		} );
	} );

	it( 'should store a generated ID for a created order', () => {
		const action = {
			type: WOOCOMMERCE_UI_ORDERS_EDIT,
			siteId: 123,
			order: {
				first_name: 'Alex',
			},
		};
		const newState = reducer( undefined, action );
		expect( newState.currentlyEditingId.placeholder ).to.exist;
		expect( newState.changes ).to.eql( {
			first_name: 'Alex',
		} );
	} );

	it( 'should clear order changes from the state when requested', () => {
		const action = {
			type: WOOCOMMERCE_UI_ORDERS_CLEAR,
			siteId: 123,
		};
		const originalState = deepFreeze( {
			currentlyEditingId: 40,
			changes: {
				first_name: 'Joan',
			},
		} );
		const newState = reducer( originalState, action );
		expect( newState ).to.eql( {
			currentlyEditingId: null,
			changes: {},
		} );
	} );
} );
