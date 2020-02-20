/**
 * Internal dependencies
 */
import reducer from '../../reducer';
import { fetchShippingZoneMethodsSuccess } from '../actions';
import { WOOCOMMERCE_SHIPPING_ZONE_METHODS_REQUEST } from 'woocommerce/state/action-types';
import { LOADING } from 'woocommerce/state/constants';

describe( 'fetch shipping zone methods', () => {
	test( 'should mark the shipping zone methods list as "loading"', () => {
		const siteId = 123;
		const state = {
			[ siteId ]: {
				shippingZones: [ { id: 7 } ],
			},
		};

		const newSiteData = reducer( state, {
			type: WOOCOMMERCE_SHIPPING_ZONE_METHODS_REQUEST,
			zoneId: 7,
			siteId,
		} );
		expect( newSiteData[ siteId ].shippingZones ).toEqual( [ { id: 7, methodIds: LOADING } ] );
	} );
} );

describe( 'fetch shipping zone methods - success', () => {
	test( 'should store data from the action', () => {
		const siteId = 123;
		const state = {
			[ siteId ]: {
				shippingZones: [ { id: 1, methodIds: LOADING } ],
			},
		};

		const methods = [
			{
				id: 4,
				method_id: 'free_shipping',
				enabled: true,
				order: 1,
				settings: {
					field: { value: 'hello' },
				},
			},
			{
				id: 7,
				method_id: 'local_pickup',
				enabled: false,
				order: 2,
				settings: {
					field: { value: 'goodbye' },
				},
			},
		];
		const newState = reducer( state, fetchShippingZoneMethodsSuccess( siteId, 1, methods ) );
		expect( newState[ siteId ] ).toBeTruthy();
		expect( newState[ siteId ].shippingZoneMethods ).toEqual( {
			4: { id: 4, methodType: 'free_shipping', enabled: true, order: 1, field: 'hello' },
			7: { id: 7, methodType: 'local_pickup', enabled: false, order: 2, field: 'goodbye' },
		} );
		expect( newState[ siteId ].shippingZones ).toEqual( [ { id: 1, methodIds: [ 4, 7 ] } ] );
	} );

	test( 'should overwrite previous methods with the same ID', () => {
		const siteId = 123;
		const state = {
			[ siteId ]: {
				shippingZones: [ { id: 1, methodIds: LOADING } ],
				shippingZoneMethods: {
					7: {
						id: 7,
						enabled: true,
						methodType: 'free_shipping',
						something: 'something',
						order: 3,
					},
					42: { id: 42, enabled: false, methodType: 'local_pickup', order: 1 },
				},
			},
		};

		const methods = [
			{ id: 4, enabled: true, method_id: 'free_shipping', order: 1 },
			{ id: 7, enabled: false, method_id: 'local_pickup', order: 2 },
		];
		const newState = reducer( state, fetchShippingZoneMethodsSuccess( siteId, 1, methods ) );
		expect( newState[ siteId ] ).toBeTruthy();
		expect( newState[ siteId ].shippingZoneMethods ).toEqual( {
			4: { id: 4, enabled: true, methodType: 'free_shipping', order: 1 },
			7: { id: 7, enabled: false, methodType: 'local_pickup', order: 2 },
			42: { id: 42, enabled: false, methodType: 'local_pickup', order: 1 },
		} );
		expect( newState[ siteId ].shippingZones ).toEqual( [ { id: 1, methodIds: [ 4, 7 ] } ] );
	} );
} );
