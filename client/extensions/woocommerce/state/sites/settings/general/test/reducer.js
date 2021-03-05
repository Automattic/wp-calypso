/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import {
	WOOCOMMERCE_SETTINGS_BATCH_REQUEST_SUCCESS,
	WOOCOMMERCE_SETTINGS_GENERAL_REQUEST,
	WOOCOMMERCE_SETTINGS_GENERAL_RECEIVE,
} from 'woocommerce/state/action-types';
import { ERROR, LOADING } from 'woocommerce/state/constants';
import reducer from 'woocommerce/state/sites/reducer';

describe( 'reducer', () => {
	describe( 'generalRequest', () => {
		test( 'should mark the settings general tree as "loading" if no settings are loaded', () => {
			const siteId = 123;
			const action = {
				type: WOOCOMMERCE_SETTINGS_GENERAL_REQUEST,
				siteId,
				meta: { dataLayer: { doBypass: true } },
			};

			const newSiteData = reducer( {}, action );
			expect( newSiteData[ siteId ].settings.general ).to.eql( LOADING );
		} );
		test( 'should do nothing if settings are already loaded', () => {
			const siteId = 123;
			const action = {
				type: WOOCOMMERCE_SETTINGS_GENERAL_REQUEST,
				siteId,
				meta: { dataLayer: { doBypass: true } },
			};
			const data = [
				{
					id: 'woocommerce_default_country',
					label: 'Base location',
					description: 'This is the base location for your business.',
					type: 'select',
					default: 'GB',
					tip:
						'This is the base location for your business. Tax rates will be based on this country.',
					value: 'US:MA',
					options: {},
				},
			];
			const state = {
				123: {
					settings: {
						general: data,
					},
				},
			};
			const newSiteData = reducer( state, action );
			expect( newSiteData[ siteId ].settings.general ).to.eql( data );
		} );
		test( 'should store data from the action', () => {
			const siteId = 123;
			const settings = [ {}, {} ];
			const action = {
				type: WOOCOMMERCE_SETTINGS_GENERAL_RECEIVE,
				siteId,
				data: settings,
			};
			const newState = reducer( {}, action );
			expect( newState[ siteId ] ).to.exist;
			expect( newState[ siteId ].settings ).to.exist;
			expect( newState[ siteId ].settings.general ).to.deep.equal( settings );
		} );
		test( 'should handle error from the action', () => {
			const siteId = 123;
			const action = {
				type: WOOCOMMERCE_SETTINGS_GENERAL_RECEIVE,
				siteId,
				error: 'rest_no_route',
			};
			const newState = reducer( {}, action );
			expect( newState[ siteId ] ).to.exist;
			expect( newState[ siteId ].settings ).to.exist;
			expect( newState[ siteId ].settings.general ).to.eql( ERROR );
		} );
	} );

	describe( 'settings batch', () => {
		test( 'should merge data from the action', () => {
			const siteId = 123;
			const emptyState = {
				123: {
					settings: {
						general: [],
					},
				},
			};
			const streetSetting = {
				group_id: 'general',
				id: 'woocommerce_store_address',
				value: '311 Maple St',
			};
			const citySetting = {
				group_id: 'general',
				id: 'woocommerce_store_city',
				value: 'Snohomish',
			};
			const updatedStreetSetting = {
				group_id: 'general',
				id: 'woocommerce_store_address',
				value: '1206 First St',
			};
			const action = {
				type: WOOCOMMERCE_SETTINGS_BATCH_REQUEST_SUCCESS,
				siteId,
				data: { update: [ streetSetting, citySetting ] },
			};
			const updatedSettings = [ updatedStreetSetting, citySetting ];
			const updateAction = {
				type: WOOCOMMERCE_SETTINGS_BATCH_REQUEST_SUCCESS,
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
