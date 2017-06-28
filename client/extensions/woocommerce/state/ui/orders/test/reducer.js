/**
 * External dependencies
 */
import { expect } from 'chai';
import deepFreeze from 'deep-freeze';

/**
 * Internal dependencies
 */
import reducer from '../reducer';
import { WOOCOMMERCE_UI_ORDERS_SET_PAGE } from 'woocommerce/state/action-types';

describe( 'reducer', () => {
	describe( 'currentPage', () => {
		it( 'should have no change by default', () => {
			const newState = reducer( undefined, {} );
			expect( newState ).to.eql( {} );
		} );

		it( 'should store the current page', () => {
			const action = {
				type: WOOCOMMERCE_UI_ORDERS_SET_PAGE,
				siteId: 123,
				page: 2,
			};
			const newState = reducer( undefined, action );
			expect( newState ).to.eql( { 123: { currentPage: 2 } } );
		} );

		it( 'should should update the current page when changed', () => {
			const action = {
				type: WOOCOMMERCE_UI_ORDERS_SET_PAGE,
				siteId: 123,
				page: 2,
			};
			const originalState = deepFreeze( { 123: { currentPage: 3 } } );
			const newState = reducer( originalState, action );
			expect( newState ).to.eql( { 123: { currentPage: 2 } } );
		} );

		it( 'should should store the current page for more than one site', () => {
			const action = {
				type: WOOCOMMERCE_UI_ORDERS_SET_PAGE,
				siteId: 234,
				page: 2,
			};
			const originalState = deepFreeze( { 123: { currentPage: 3 } } );
			const newState = reducer( originalState, action );
			expect( newState ).to.eql( { 123: { currentPage: 3 }, 234: { currentPage: 2 } } );
		} );

		it( 'should should remove the key when re-set to initial state', () => {
			const action = {
				type: WOOCOMMERCE_UI_ORDERS_SET_PAGE,
				siteId: 123,
				page: 1,
			};
			const originalState = deepFreeze( { 123: { currentPage: 3 } } );
			const newState = reducer( originalState, action );
			expect( newState ).to.eql( {} );
		} );
	} );
} );
