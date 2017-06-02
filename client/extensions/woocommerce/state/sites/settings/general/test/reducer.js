/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import reducer from '../../../reducer';
import { LOADING } from '../reducer';
import {
	WOOCOMMERCE_API_FETCH_SETTINGS_GENERAL,
} from 'woocommerce/state/action-types';
import { fetchSettingsGeneralSuccess } from '../actions';

describe( 'fetch settings general', () => {
	it( 'should mark the settings general tree as "loading"', () => {
		const siteId = 123;
		const state = {};

		const newSiteData = reducer( state, { type: WOOCOMMERCE_API_FETCH_SETTINGS_GENERAL, payload: { siteId } } );
		expect( newSiteData[ siteId ].settingsGeneral ).to.eql( LOADING );
	} );
} );

describe( 'fetch settings general - success', () => {
	it( 'should store data from the action', () => {
		const siteId = 123;
		const state = {};

		const settings = [
			{},
			{},
		];
		const newState = reducer( state, fetchSettingsGeneralSuccess( siteId, settings ) );
		expect( newState[ siteId ] ).to.exist;
		expect( newState[ siteId ].settingsGeneral ).to.deep.equal( settings );
	} );
} );
