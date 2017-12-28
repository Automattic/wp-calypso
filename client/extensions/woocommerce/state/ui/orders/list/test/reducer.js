/** @format */

/**
 * External dependencies
 */
import { expect } from 'chai';
import deepFreeze from 'deep-freeze';

/**
 * Internal dependencies
 */
import reducer from '../reducer';
import { WOOCOMMERCE_UI_ORDERS_SET_QUERY } from 'client/extensions/woocommerce/state/action-types';

describe( 'reducer', () => {
	test( 'should store the current query', () => {
		const action = {
			type: WOOCOMMERCE_UI_ORDERS_SET_QUERY,
			siteId: 123,
			query: {
				page: 2,
			},
		};
		const newState = reducer( undefined, action );
		expect( newState ).to.eql( { currentPage: 2, currentSearch: '' } );
	} );

	test( 'should update the current page when changed', () => {
		const action = {
			type: WOOCOMMERCE_UI_ORDERS_SET_QUERY,
			siteId: 123,
			query: {
				page: 2,
			},
		};
		const originalState = deepFreeze( { currentPage: 3, currentSearch: '' } );
		const newState = reducer( originalState, action );
		expect( newState ).to.eql( { currentPage: 2, currentSearch: '' } );
	} );

	test( 'should update the current search when changed', () => {
		const action = {
			type: WOOCOMMERCE_UI_ORDERS_SET_QUERY,
			siteId: 123,
			query: {
				search: 'example',
			},
		};
		const originalState = deepFreeze( { currentPage: 3, currentSearch: '' } );
		const newState = reducer( originalState, action );
		expect( newState ).to.eql( { currentPage: 3, currentSearch: 'example' } );
	} );
} );
