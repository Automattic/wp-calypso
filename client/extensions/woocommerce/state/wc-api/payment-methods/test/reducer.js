/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import reducer from '../../reducer';
import { LOADING } from '../reducer';
import {
	WOOCOMMERCE_API_FETCH_PAYMENT_METHODS,
} from '../../../action-types';
import { fetchPaymentMethodsSuccess } from '../actions';

describe( 'fetch payment methods', () => {
	it( 'should mark the payment methods tree as being "loading"', () => {
		const siteId = 123;
		const state = {};

		const newSiteData = reducer( state, { type: WOOCOMMERCE_API_FETCH_PAYMENT_METHODS, payload: { siteId } } );
		expect( newSiteData[ siteId ].paymentMethods ).to.eql( LOADING );
	} );
} );

describe( 'fetch payment methods - success', () => {
	it( 'should store data from the action', () => {
		const siteId = 123;
		const state = {};

		const zones = [
			{ id: 'foo', title: 'foo' },
			{ id: 'bar', title: 'bar' },
		];
		const newState = reducer( state, fetchPaymentMethodsSuccess( siteId, zones ) );
		expect( newState[ siteId ] ).to.exist;
		expect( newState[ siteId ].paymentMethods ).to.deep.equal( zones );
	} );
} );
