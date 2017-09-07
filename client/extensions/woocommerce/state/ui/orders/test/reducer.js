/**
 * External dependencies
 */
import { expect } from 'chai';
import deepFreeze from 'deep-freeze';

/**
 * Internal dependencies
 */
import reducer from '../reducer';
import { WOOCOMMERCE_UI_ORDERS_SET_QUERY } from 'woocommerce/state/action-types';

describe( 'reducer', () => {
	it( 'should store the current query for more than one site', () => {
		const action = {
			type: WOOCOMMERCE_UI_ORDERS_SET_QUERY,
			siteId: 234,
			query: {
				search: 'test'
			},
		};
		const originalState = deepFreeze( { 123: { list: { currentPage: 3, currentSearch: '' } } } );
		const newState = reducer( originalState, action );
		expect( newState ).to.eql( {
			123: { list: { currentPage: 3, currentSearch: '' } },
			234: { list: { currentPage: 1, currentSearch: 'test' } },
		} );
	} );
} );
