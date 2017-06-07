/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import reducer from '../../reducer';
import {
	WOOCOMMERCE_SHIPPING_ZONE_METHODS_REQUEST,
} from 'woocommerce/state/action-types';
import { fetchShippingZoneMethodsSuccess } from '../actions';
import { LOADING } from 'woocommerce/state/constants';

describe( 'fetch shipping zone methods', () => {
	it( 'should mark the shipping zone methods list as "loading"', () => {
		const siteId = 123;
		const state = {
			[ siteId ]: {
				shippingZones: [
					{ id: 7 },
				],
			},
		};

		const newSiteData = reducer( state, {
			type: WOOCOMMERCE_SHIPPING_ZONE_METHODS_REQUEST,
			zoneId: 7,
			siteId,
		} );
		expect( newSiteData[ siteId ].shippingZones ).to.deep.equal( [
			{ id: 7, methodIds: LOADING },
		] );
	} );
} );

describe( 'fetch shipping zone methods - success', () => {
	it( 'should store data from the action', () => {
		const siteId = 123;
		const state = {
			[ siteId ]: {
				shippingZones: [
					{ id: 1, methodIds: LOADING },
				],
			},
		};

		const methods = [
			{ id: 4, method_id: 'free_shipping' },
			{ id: 7, method_id: 'local_pickup' },
		];
		const newState = reducer( state, fetchShippingZoneMethodsSuccess( siteId, 1, methods ) );
		expect( newState[ siteId ] ).to.exist;
		expect( newState[ siteId ].shippingZoneMethods ).to.deep.equal( {
			4: { id: 4, method_id: 'free_shipping' },
			7: { id: 7, method_id: 'local_pickup' },
		} );
		expect( newState[ siteId ].shippingZones ).to.deep.equal( [
			{ id: 1, methodIds: [ 4, 7 ] },
		] );
	} );

	it( 'should overwrite previous methods with the same ID', () => {
		const siteId = 123;
		const state = {
			[ siteId ]: {
				shippingZones: [
					{ id: 1, methodIds: LOADING },
				],
				shippingZoneMethods: {
					7: { id: 7, method_id: 'free_shipping', something: 'something' },
					42: { id: 42, method_id: 'local_pickup' },
				},
			},
		};

		const methods = [
			{ id: 4, method_id: 'free_shipping' },
			{ id: 7, method_id: 'local_pickup' },
		];
		const newState = reducer( state, fetchShippingZoneMethodsSuccess( siteId, 1, methods ) );
		expect( newState[ siteId ] ).to.exist;
		expect( newState[ siteId ].shippingZoneMethods ).to.deep.equal( {
			4: { id: 4, method_id: 'free_shipping' },
			7: { id: 7, method_id: 'local_pickup' },
			42: { id: 42, method_id: 'local_pickup' },
		} );
		expect( newState[ siteId ].shippingZones ).to.deep.equal( [
			{ id: 1, methodIds: [ 4, 7 ] },
		] );
	} );
} );
