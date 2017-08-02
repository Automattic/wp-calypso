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
	it( 'should have no change by default', () => {
		const newState = reducer( undefined, {} );
		expect( newState ).to.eql( {} );
	} );

	it( 'should store the current query', () => {
		const action = {
			type: WOOCOMMERCE_UI_ORDERS_SET_QUERY,
			siteId: 123,
			query: {
				page: 2,
			},
		};
		const newState = reducer( undefined, action );
		expect( newState ).to.eql( { 123: { currentPage: 2, currentSearch: '' } } );
	} );

	it( 'should update the current page when changed', () => {
		const action = {
			type: WOOCOMMERCE_UI_ORDERS_SET_QUERY,
			siteId: 123,
			query: {
				page: 2,
			},
		};
		const originalState = deepFreeze( { 123: { currentPage: 3, currentSearch: '' } } );
		const newState = reducer( originalState, action );
		expect( newState ).to.eql( { 123: { currentPage: 2, currentSearch: '' } } );
	} );

	it( 'should update the current search when changed', () => {
		const action = {
			type: WOOCOMMERCE_UI_ORDERS_SET_QUERY,
			siteId: 123,
			query: {
				search: 'example'
			},
		};
		const originalState = deepFreeze( { 123: { currentPage: 3, currentSearch: '' } } );
		const newState = reducer( originalState, action );
		expect( newState ).to.eql( { 123: { currentPage: 3, currentSearch: 'example' } } );
	} );

	it( 'should store the current query for more than one site', () => {
		const action = {
			type: WOOCOMMERCE_UI_ORDERS_SET_QUERY,
			siteId: 234,
			query: {
				search: 'test'
			},
		};
		const originalState = deepFreeze( { 123: { currentPage: 3, currentSearch: '' } } );
		const newState = reducer( originalState, action );
		expect( newState ).to.eql( {
			123: { currentPage: 3, currentSearch: '' },
			234: { currentPage: 1, currentSearch: 'test' }
		} );
	} );

	it( 'should remove the key when page is re-set to initial state', () => {
		const action = {
			type: WOOCOMMERCE_UI_ORDERS_SET_QUERY,
			siteId: 123,
			query: {
				page: 1,
			}
		};
		const originalState = deepFreeze( { 123: { currentPage: 3, currentSearch: '' } } );
		const newState = reducer( originalState, action );
		expect( newState ).to.eql( {} );
	} );

	it( 'should remove the key when search is re-set to initial state', () => {
		const action = {
			type: WOOCOMMERCE_UI_ORDERS_SET_QUERY,
			siteId: 123,
			query: {
				search: '',
			}
		};
		const originalState = deepFreeze( { 123: { currentPage: 1, currentSearch: 'test' } } );
		const newState = reducer( originalState, action );
		expect( newState ).to.eql( {} );
	} );
} );
