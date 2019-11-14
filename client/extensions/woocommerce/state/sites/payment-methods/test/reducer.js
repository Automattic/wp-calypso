/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import reducer from '../../reducer';
import {
	WOOCOMMERCE_PAYMENT_METHOD_UPDATE_SUCCESS,
	WOOCOMMERCE_PAYMENT_METHODS_REQUEST,
	WOOCOMMERCE_PAYMENT_METHODS_REQUEST_SUCCESS,
} from 'woocommerce/state/action-types';
import { LOADING } from 'woocommerce/state/constants';

describe( 'reducer', () => {
	test( 'should mark the payment methods tree as "loading"', () => {
		const siteId = 123;
		const state = {};
		const action = {
			type: WOOCOMMERCE_PAYMENT_METHODS_REQUEST,
			siteId,
			data: {},
		};

		const newState = reducer( state, action );
		expect( newState[ siteId ].paymentMethods ).to.eql( LOADING );
	} );

	test( 'should store data from the request action', () => {
		const siteId = 123;
		const state = {};
		const action = {
			type: WOOCOMMERCE_PAYMENT_METHODS_REQUEST_SUCCESS,
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

	test( 'should store data from the update success action', () => {
		const siteId = 123;
		const state = {
			[ siteId ]: {
				paymentMethods: [ { id: 'bar', title: 'bar' } ],
			},
		};
		const action = {
			type: WOOCOMMERCE_PAYMENT_METHOD_UPDATE_SUCCESS,
			siteId,
			data: { id: 'bar', title: 'bang' },
		};

		const newState = reducer( state, action );
		expect( newState[ siteId ] ).to.exist;
		expect( newState[ siteId ].paymentMethods ).to.deep.equal( [ { id: 'bar', title: 'bang' } ] );
	} );
} );
