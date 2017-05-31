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
	WOOCOMMERCE_API_FETCH_SHIPPING_ZONES,
} from 'woocommerce/state/action-types';
import { fetchShippingZonesSuccess } from '../actions';

describe( 'fetch shipping zones', () => {
	it( 'should mark the shipping zones tree as being "loading"', () => {
		const siteId = 123;
		const state = {};

		const newSiteData = reducer( state, { type: WOOCOMMERCE_API_FETCH_SHIPPING_ZONES, payload: { siteId } } );
		expect( newSiteData[ siteId ].shippingZones ).to.eql( LOADING );
	} );
} );

describe( 'fetch shipping zones - success', () => {
	it( 'should store data from the action', () => {
		const siteId = 123;
		const state = {};

		const zones = [
			{ id: 0, name: 'Rest of the World' },
			{ id: 1, name: 'USA' },
		];
		const newState = reducer( state, fetchShippingZonesSuccess( siteId, zones ) );
		expect( newState[ siteId ] ).to.exist;
		expect( newState[ siteId ].shippingZones ).to.deep.equal( zones );
	} );
} );

