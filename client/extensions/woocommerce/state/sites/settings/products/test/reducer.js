/** @format */
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
	WOOCOMMERCE_SETTINGS_BATCH_REQUEST_SUCCESS,
	WOOCOMMERCE_SETTINGS_PRODUCTS_REQUEST,
	WOOCOMMERCE_SETTINGS_PRODUCTS_REQUEST_SUCCESS,
} from 'woocommerce/state/action-types';

describe( 'reducer', () => {
	it( 'should mark the settings products tree as "loading"', () => {
		const siteId = 123;
		const action = {
			type: WOOCOMMERCE_SETTINGS_PRODUCTS_REQUEST,
			siteId,
		};

		const newSiteData = reducer( {}, action );
		expect( newSiteData[ siteId ].settings.products ).to.eql( LOADING );
	} );

	it( 'should store data from the action', () => {
		const siteId = 123;
		const settings = [ {}, {} ];
		const action = {
			type: WOOCOMMERCE_SETTINGS_PRODUCTS_REQUEST_SUCCESS,
			siteId,
			data: settings,
		};
		const newState = reducer( {}, action );
		expect( newState[ siteId ] ).to.exist;
		expect( newState[ siteId ].settings ).to.exist;
		expect( newState[ siteId ].settings.products ).to.deep.equal( settings );
	} );

	it( 'should store only product data from the action on batch', () => {
		const siteId = 123;
		const emptyState = {
			123: {
				settings: {
					products: [],
				},
			},
		};
		const dimensionsSetting = {
			group_id: 'products',
			id: 'woocommerce_dimension_unit',
			value: 'yd',
		};
		const weightSetting = {
			group_id: 'products',
			id: 'woocommerce_weight_unit',
			value: 'lbs',
		};
		const citySetting = {
			group_id: 'general',
			id: 'woocommerce_store_city',
			value: 'Snohomish',
		};
		const updatedDimensionsSetting = {
			group_id: 'products',
			id: 'woocommerce_dimension_unit',
			value: 'mm',
		};
		const action = {
			type: WOOCOMMERCE_SETTINGS_BATCH_REQUEST_SUCCESS,
			siteId,
			data: { update: [ dimensionsSetting, weightSetting, citySetting ] },
		};
		const updatedSettings = [ updatedDimensionsSetting, weightSetting ];
		const updateAction = {
			type: WOOCOMMERCE_SETTINGS_BATCH_REQUEST_SUCCESS,
			siteId,
			data: { update: [ updatedDimensionsSetting ] },
		};
		const state = reducer( emptyState, action );
		const updatedState = reducer( state, updateAction );
		expect( updatedState[ siteId ] ).to.exist;
		expect( updatedState[ siteId ].settings ).to.exist;
		expect( updatedState[ siteId ].settings.products ).to.deep.equal( updatedSettings );
	} );
} );
