/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import reducer from '../../reducer';
import { LOADING } from 'woocommerce/state/constants';
import {
	WOOCOMMERCE_API_FETCH_PAYMENT_METHODS,
	WOOCOMMERCE_API_FETCH_PAYMENT_METHODS_SUCCESS,
} from 'woocommerce/state/action-types';

describe( 'reducer', () => {
	it( 'should mark the payment methods tree as "loading"', () => {
		const siteId = 123;
		const state = {};
		const action = {
			type: WOOCOMMERCE_API_FETCH_PAYMENT_METHODS,
			siteId,
			data: {},
		};

		const newState = reducer( state, action );
		expect( newState[ siteId ].paymentMethods ).to.eql( LOADING );
	} );

	it( 'should store data from the action', () => {
		const siteId = 123;
		const state = {};
		const action = {
			type: WOOCOMMERCE_API_FETCH_PAYMENT_METHODS_SUCCESS,
			siteId,
			data: [
				{ id: 'foo', title: 'foo' },
				{ id: 'bar', title: 'bar' },
			],
		};

		const newState = reducer( state, action );
		expect( newState[ siteId ] ).to.exist;
		expect( newState[ siteId ].paymentMethods ).to.deep.equal( [
			{ id: 'foo', title: 'foo' },
			{ id: 'bar', title: 'bar' },
		] );
	} );
} );
