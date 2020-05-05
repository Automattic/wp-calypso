/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import reducer from '../../reducer';
import { fetchShippingMethodsSuccess } from '../actions';
import { WOOCOMMERCE_SHIPPING_METHODS_REQUEST } from 'woocommerce/state/action-types';
import { LOADING } from 'woocommerce/state/constants';

describe( 'fetch shipping methods', () => {
	test( 'should mark the shipping methods tree as "loading"', () => {
		const siteId = 123;
		const state = {};

		const newSiteData = reducer( state, { type: WOOCOMMERCE_SHIPPING_METHODS_REQUEST, siteId } );
		expect( newSiteData[ siteId ].shippingMethods ).to.eql( LOADING );
	} );
} );

describe( 'fetch shipping methods - success', () => {
	test( 'should store data from the action', () => {
		const siteId = 123;
		const state = {};

		const methods = [
			{ id: 'free_shipping', title: 'Free Shipping' },
			{ id: 'local_pickup', title: 'Local Pickup' },
		];
		const newState = reducer( state, fetchShippingMethodsSuccess( siteId, methods ) );
		expect( newState[ siteId ] ).to.exist;
		expect( newState[ siteId ].shippingMethods ).to.deep.equal( methods );
	} );
} );
