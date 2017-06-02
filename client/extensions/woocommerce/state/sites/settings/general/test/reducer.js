/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import reducer from 'woocommerce/state/sites/reducer';
import { LOADING } from 'woocommerce/state/constants';
import {
	WOOCOMMERCE_API_FETCH_SETTINGS_GENERAL,
	WOOCOMMERCE_API_FETCH_SETTINGS_GENERAL_SUCCESS,
} from 'woocommerce/state/action-types';

describe( 'reducer', () => {
	it( 'should mark the settings general tree as "loading"', () => {
		const siteId = 123;
		const action = {
			type: WOOCOMMERCE_API_FETCH_SETTINGS_GENERAL,
			siteId,
		};

		const newSiteData = reducer( {}, action );
		expect( newSiteData[ siteId ].settingsGeneral ).to.eql( LOADING );
	} );

	it( 'should store data from the action', () => {
		const siteId = 123;
		const settings = [
			{},
			{},
		];
		const action = {
			type: WOOCOMMERCE_API_FETCH_SETTINGS_GENERAL_SUCCESS,
			siteId,
			data: settings,
		};
		const newState = reducer( {}, action );
		expect( newState[ siteId ] ).to.exist;
		expect( newState[ siteId ].settingsGeneral ).to.deep.equal( settings );
	} );
} );
