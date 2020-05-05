/**
 * External dependencies
 */
import { expect } from 'chai';
import deepFreeze from 'deep-freeze';
import { keyBy } from 'lodash';

/**
 * Internal dependencies
 */
import { isSearching, items, queries } from '../reducer';
import customers from './fixtures/customers';
import {
	WOOCOMMERCE_CUSTOMERS_REQUEST,
	WOOCOMMERCE_CUSTOMERS_REQUEST_FAILURE,
	WOOCOMMERCE_CUSTOMERS_REQUEST_SUCCESS,
} from 'woocommerce/state/action-types';

describe( 'reducer', () => {
	describe( 'isSearching', () => {
		test( 'should have no change by default', () => {
			const newState = isSearching( undefined, {} );
			expect( newState ).to.eql( {} );
		} );

		test( 'should store that a search is in progress', () => {
			const action = {
				type: WOOCOMMERCE_CUSTOMERS_REQUEST,
				siteId: 123,
				searchTerm: 'example',
			};
			const newState = isSearching( undefined, action );
			expect( newState ).to.eql( { example: true } );
		} );

		test( 'should show that a search is not in progress after a success', () => {
			const action = {
				type: WOOCOMMERCE_CUSTOMERS_REQUEST_SUCCESS,
				siteId: 123,
				searchTerm: 'example',
				customers,
			};
			const newState = isSearching( { example: true }, action );
			expect( newState ).to.eql( { example: false } );
		} );

		test( 'should show that a search is not in progress after a failure', () => {
			const action = {
				type: WOOCOMMERCE_CUSTOMERS_REQUEST_FAILURE,
				siteId: 123,
				searchTerm: 'example',
				error: {},
			};
			const newState = isSearching( { example: true }, action );
			expect( newState ).to.eql( { example: false } );
		} );
	} );

	describe( 'items', () => {
		test( 'should have no change by default', () => {
			const newState = items( undefined, {} );
			expect( newState ).to.eql( {} );
		} );

		test( 'should store the customers in state', () => {
			const action = {
				type: WOOCOMMERCE_CUSTOMERS_REQUEST_SUCCESS,
				siteId: 123,
				searchTerm: 'example',
				customers,
			};
			const newState = items( undefined, action );
			const customersById = keyBy( customers, 'id' );
			expect( newState ).to.eql( customersById );
		} );

		test( 'should add new customers onto the existing customer list', () => {
			const newCustomer = {
				id: 4,
				first_name: 'Jesse',
				last_name: 'Banks',
			};
			const action = {
				type: WOOCOMMERCE_CUSTOMERS_REQUEST_SUCCESS,
				siteId: 123,
				searchTerm: 'banks',
				customers: [ newCustomer ],
			};
			const originalState = deepFreeze( keyBy( customers, 'id' ) );
			const newState = items( originalState, action );
			expect( newState ).to.eql( { ...originalState, 4: newCustomer } );
		} );

		test( 'should do nothing on a failure', () => {
			const action = {
				type: WOOCOMMERCE_CUSTOMERS_REQUEST_FAILURE,
				siteId: 123,
				searchTerm: 'example',
				error: {},
			};
			const originalState = deepFreeze( keyBy( customers, 'id' ) );
			const newState = items( originalState, action );
			expect( newState ).to.eql( originalState );
		} );
	} );

	describe( 'queries', () => {
		test( 'should have no change by default', () => {
			const newState = queries( undefined, {} );
			expect( newState ).to.eql( {} );
		} );

		test( 'should store the customer IDs for the requested search term', () => {
			const action = {
				type: WOOCOMMERCE_CUSTOMERS_REQUEST_SUCCESS,
				siteId: 123,
				searchTerm: 'example',
				customers,
			};
			const newState = queries( undefined, action );
			expect( newState ).to.eql( { example: [ 2, 3 ] } );
		} );

		test( 'should store a different search term result as a separate list', () => {
			const newCustomer = {
				id: 4,
				first_name: 'Jesse',
				last_name: 'Banks',
			};
			const action = {
				type: WOOCOMMERCE_CUSTOMERS_REQUEST_SUCCESS,
				siteId: 123,
				searchTerm: 'banks',
				customers: [ newCustomer ],
			};
			const originalState = deepFreeze( { example: [ 2, 3 ] } );
			const newState = queries( originalState, action );
			expect( newState ).to.eql( { ...originalState, banks: [ 4 ] } );
		} );

		test( 'should do nothing on a failure', () => {
			const action = {
				type: WOOCOMMERCE_CUSTOMERS_REQUEST_FAILURE,
				siteId: 123,
				searchTerm: 'example',
				error: {},
			};
			const originalState = deepFreeze( { test: [ 1, 5 ] } );
			const newState = queries( originalState, action );
			expect( newState ).to.eql( originalState );
		} );
	} );
} );
