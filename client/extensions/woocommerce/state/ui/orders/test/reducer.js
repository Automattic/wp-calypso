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
		expect( newState ).to.eql( { 123: { currentPage: 2, currentStatus: 'any' } } );
	} );

	it( 'should should update the current page when changed', () => {
		const action = {
			type: WOOCOMMERCE_UI_ORDERS_SET_QUERY,
			siteId: 123,
			query: {
				page: 2,
			},
		};
		const originalState = deepFreeze( { 123: { currentPage: 3, currentStatus: 'any' } } );
		const newState = reducer( originalState, action );
		expect( newState ).to.eql( { 123: { currentPage: 2, currentStatus: 'any' } } );
	} );

	it( 'should should update the current status when changed', () => {
		const action = {
			type: WOOCOMMERCE_UI_ORDERS_SET_QUERY,
			siteId: 123,
			query: {
				status: 'completed'
			},
		};
		const originalState = deepFreeze( { 123: { currentPage: 3, currentStatus: 'any' } } );
		const newState = reducer( originalState, action );
		expect( newState ).to.eql( { 123: { currentPage: 3, currentStatus: 'completed' } } );
	} );

	it( 'should should store the current query for more than one site', () => {
		const action = {
			type: WOOCOMMERCE_UI_ORDERS_SET_QUERY,
			siteId: 234,
			query: {
				status: 'on-hold'
			},
		};
		const originalState = deepFreeze( { 123: { currentPage: 3, currentStatus: 'any' } } );
		const newState = reducer( originalState, action );
		expect( newState ).to.eql( {
			123: { currentPage: 3, currentStatus: 'any' },
			234: { currentPage: 1, currentStatus: 'on-hold' }
		} );
	} );

	it( 'should should remove the key when re-set to initial state', () => {
		const action = {
			type: WOOCOMMERCE_UI_ORDERS_SET_QUERY,
			siteId: 123,
			query: {
				page: 1,
			}
		};
		const originalState = deepFreeze( { 123: { currentPage: 3, currentStatus: 'any' } } );
		const newState = reducer( originalState, action );
		expect( newState ).to.eql( {} );
	} );
} );
