/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { customersFailure, customersReceive, searchCustomers } from '../actions';
import customers from './fixtures/customers';
import {
	WOOCOMMERCE_CUSTOMERS_REQUEST,
	WOOCOMMERCE_CUSTOMERS_REQUEST_FAILURE,
	WOOCOMMERCE_CUSTOMERS_REQUEST_SUCCESS,
} from 'woocommerce/state/action-types';

describe( 'actions', () => {
	describe( '#searchCustomers()', () => {
		test( 'should return an action', () => {
			const action = searchCustomers( 123, 'example' );
			expect( action ).to.eql( {
				type: WOOCOMMERCE_CUSTOMERS_REQUEST,
				siteId: 123,
				searchTerm: 'example',
			} );
		} );
	} );

	describe( '#customersReceive', () => {
		test( 'should return a success action with the customer list when request completes', () => {
			const action = customersReceive( 123, 'example', customers );
			expect( action ).to.eql( {
				type: WOOCOMMERCE_CUSTOMERS_REQUEST_SUCCESS,
				siteId: 123,
				searchTerm: 'example',
				customers,
			} );
		} );

		test( 'should return a failure action if the response is an error object', () => {
			const action = customersReceive( 123, 'example', { code: 'rest_no_route' } );
			expect( action ).to.eql( {
				type: WOOCOMMERCE_CUSTOMERS_REQUEST_FAILURE,
				siteId: 123,
				searchTerm: 'example',
				error: { code: 'rest_no_route' },
			} );
		} );
	} );

	describe( '#customersFailure', () => {
		test( 'should return a failure action with the error when a the request fails', () => {
			const action = customersFailure( 234, 'test' );
			expect( action ).to.eql( {
				type: WOOCOMMERCE_CUSTOMERS_REQUEST_FAILURE,
				siteId: 234,
				searchTerm: 'test',
				error: false,
			} );
		} );
	} );
} );
