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
	WOOCOMMERCE_SETTINGS_GENERAL_BATCH_REQUEST_SUCCESS,
	WOOCOMMERCE_SETTINGS_GENERAL_REQUEST,
	WOOCOMMERCE_SETTINGS_GENERAL_REQUEST_SUCCESS,
} from 'woocommerce/state/action-types';

describe( 'reducer', () => {
	describe( 'generalRequest', () => {
		it( 'should mark the settings general tree as "loading"', () => {
			const siteId = 123;
			const action = {
				type: WOOCOMMERCE_SETTINGS_GENERAL_REQUEST,
				siteId,
			};

			const newSiteData = reducer( {}, action );
			expect( newSiteData[ siteId ].settings.general ).to.eql( LOADING );
		} );

		it( 'should store data from the action', () => {
			const siteId = 123;
			const settings = [
				{},
				{},
			];
			const action = {
				type: WOOCOMMERCE_SETTINGS_GENERAL_REQUEST_SUCCESS,
				siteId,
				data: settings,
			};
			const newState = reducer( {}, action );
			expect( newState[ siteId ] ).to.exist;
			expect( newState[ siteId ].settings ).to.exist;
			expect( newState[ siteId ].settings.general ).to.deep.equal( settings );
		} );
	} );

	describe( 'addressUpdateRequest', () => {
		it( 'should merge data from the action', () => {
			const siteId = 123;
			const emptyState = {
				123: {
					settings: {
						general: []
					}
				}
			};
			const streetSetting = {
				id: 'woocommerce_store_address',
				value: '311 Maple St',
			};
			const citySetting = {
				id: 'woocommerce_store_city',
				value: 'Snohomish',
			};
			const updatedStreetSetting = {
				id: 'woocommerce_store_address',
				value: '1206 First St',
			};
			const action = {
				type: WOOCOMMERCE_SETTINGS_GENERAL_BATCH_REQUEST_SUCCESS,
				siteId,
				data: { update: [ streetSetting, citySetting ] },
			};
			const updatedSettings = [
				updatedStreetSetting,
				citySetting,
			];
			const updateAction = {
				type: WOOCOMMERCE_SETTINGS_GENERAL_BATCH_REQUEST_SUCCESS,
				siteId,
				data: { update: [ updatedStreetSetting ] },
			};
			const state = reducer( emptyState, action );
			const updatedState = reducer( state, updateAction );
			expect( updatedState[ siteId ] ).to.exist;
			expect( updatedState[ siteId ].settings ).to.exist;
			expect( updatedState[ siteId ].settings.general ).to.deep.equal( updatedSettings );
		} );
	} );
} );
