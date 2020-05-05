/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import {
	WOOCOMMERCE_SHIPPING_ZONE_LOCATIONS_REQUEST,
	WOOCOMMERCE_SHIPPING_ZONE_LOCATIONS_REQUEST_SUCCESS,
} from 'woocommerce/state/action-types';
import { LOADING } from 'woocommerce/state/constants';
import reducer from 'woocommerce/state/sites/reducer';

describe( 'reducer', () => {
	test( 'should mark the zone locations entry as being "loading"', () => {
		const siteId = 123;
		const zoneId = 7;
		const action = {
			type: WOOCOMMERCE_SHIPPING_ZONE_LOCATIONS_REQUEST,
			siteId,
			zoneId,
		};

		const newSiteData = reducer( {}, action );
		expect( newSiteData[ siteId ].shippingZoneLocations[ zoneId ] ).to.eql( LOADING );
	} );

	test( 'should store data from the action', () => {
		const locations = [
			{ type: 'country', code: 'US' },
			{ type: 'country', code: 'CA' },
			{ type: 'continent', code: 'EU' },
			{ type: 'state', code: 'US:CA' },
			{ type: 'state', code: 'US:UT' },
			{ type: 'postcode', code: '123*' },
			{ type: 'postcode', code: '68000...68999' },
		];
		const siteId = 123;
		const zoneId = 7;
		const action = {
			type: WOOCOMMERCE_SHIPPING_ZONE_LOCATIONS_REQUEST_SUCCESS,
			siteId,
			zoneId,
			data: locations,
		};
		const newState = reducer( {}, action );
		expect( newState[ siteId ].shippingZoneLocations[ zoneId ] ).to.deep.equal( {
			continent: [ 'EU' ],
			country: [ 'US', 'CA' ],
			state: [ 'US:CA', 'US:UT' ],
			postcode: [ '123*', '68000...68999' ],
		} );
	} );
} );
