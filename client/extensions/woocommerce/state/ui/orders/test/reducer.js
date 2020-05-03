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
	WOOCOMMERCE_UI_ORDERS_EDIT,
	WOOCOMMERCE_UI_ORDERS_SET_QUERY,
} from 'woocommerce/state/action-types';

const initialState = {
	123: {
		edits: { currentlyEditingId: 1, changes: { first_name: 'Joan' } },
		list: { currentPage: 3, currentSearch: '' },
	},
};

describe( 'reducer', () => {
	test( 'should store the current query for more than one site', () => {
		const action = {
			type: WOOCOMMERCE_UI_ORDERS_SET_QUERY,
			siteId: 234,
			query: {
				search: 'test',
			},
		};
		const originalState = deepFreeze( initialState );
		const newState = reducer( originalState, action );
		expect( newState ).to.eql( {
			123: {
				edits: { currentlyEditingId: 1, changes: { first_name: 'Joan' } },
				list: { currentPage: 3, currentSearch: '' },
			},
			234: {
				edits: { currentlyEditingId: null, changes: {} },
				list: { currentPage: 1, currentSearch: 'test' },
			},
		} );
	} );

	test( 'should track the order edits for more than one site', () => {
		const action = {
			type: WOOCOMMERCE_UI_ORDERS_EDIT,
			siteId: 234,
			order: {
				id: 2,
				first_name: 'Fiona',
			},
		};
		const originalState = deepFreeze( initialState );
		const newState = reducer( originalState, action );
		expect( newState ).to.eql( {
			123: {
				edits: { currentlyEditingId: 1, changes: { first_name: 'Joan' } },
				list: { currentPage: 3, currentSearch: '' },
			},
			234: {
				edits: { currentlyEditingId: 2, changes: { first_name: 'Fiona' } },
				list: { currentPage: 1, currentSearch: '' },
			},
		} );
	} );
} );
