/**
 * External dependencies
 */
import { expect } from 'chai';
import { find } from 'lodash';

/**
 * Internal dependencies
 */
import {
	WOOCOMMERCE_SETTINGS_BATCH_REQUEST_SUCCESS,
	WOOCOMMERCE_SETTINGS_PRODUCTS_CHANGE_SETTING,
	WOOCOMMERCE_SETTINGS_PRODUCTS_REQUEST_SUCCESS,
	WOOCOMMERCE_SETTINGS_PRODUCTS_REQUEST,
	WOOCOMMERCE_SETTINGS_PRODUCTS_UPDATE_REQUEST_FAILURE,
	WOOCOMMERCE_SETTINGS_PRODUCTS_UPDATE_REQUEST_SUCCESS,
} from 'woocommerce/state/action-types';
import { ERROR, LOADING } from 'woocommerce/state/constants';
import reducer from 'woocommerce/state/sites/reducer';

describe( 'reducer', () => {
	test( 'should mark the settings products tree as "error" when update request fails', () => {
		const siteId = 123;
		const action = {
			type: WOOCOMMERCE_SETTINGS_PRODUCTS_UPDATE_REQUEST_FAILURE,
			siteId,
		};

		const newSiteData = reducer( {}, action );
		expect( newSiteData[ siteId ].settings.products ).to.eql( ERROR );
	} );

	test( 'should not change if data.update is missing', () => {
		const siteId = 123;
		const settings = [
			{
				id: 'some-setting',
				value: 'yes',
			},
			{
				id: 'another-setting',
				value: 'no',
			},
			{
				id: 'chicken-and-ribs',
				value: '1337',
			},
			{
				id: 'yummy-bbq',
				value: 'no',
			},
		];
		const action = {
			type: WOOCOMMERCE_SETTINGS_PRODUCTS_REQUEST_SUCCESS,
			siteId,
			data: settings,
		};
		const newState = reducer( {}, action );

		const updateAction = {
			type: WOOCOMMERCE_SETTINGS_PRODUCTS_UPDATE_REQUEST_SUCCESS,
			siteId,
			data: {},
		};
		const updatedState = reducer( newState, updateAction );
		expect( updatedState[ siteId ] ).to.exist;
		expect( updatedState[ siteId ].settings ).to.exist;
		expect( updatedState[ siteId ].settings.products ).to.deep.equal( settings );
	} );

	test( 'should update the settings from data', () => {
		const siteId = 123;
		const settings = [
			{
				id: 'some-setting',
				value: 'yes',
			},
			{
				id: 'another-setting',
				value: 'no',
			},
			{
				id: 'chicken-and-ribs',
				value: '1337',
			},
			{
				id: 'yummy-bbq',
				value: 'no',
			},
		];
		const action = {
			type: WOOCOMMERCE_SETTINGS_PRODUCTS_REQUEST_SUCCESS,
			siteId,
			data: settings,
		};
		const newState = reducer( {}, action );
		expect( newState[ siteId ] ).to.exist;
		expect( newState[ siteId ].settings ).to.exist;
		expect( newState[ siteId ].settings.products ).to.deep.equal( settings );

		const updateAction = {
			type: WOOCOMMERCE_SETTINGS_PRODUCTS_UPDATE_REQUEST_SUCCESS,
			siteId,
			data: {
				update: [
					{
						id: 'chicken-and-ribs',
						value: '10',
					},
					{
						id: 'yummy-bbq',
						value: 'YAS',
					},
				],
			},
		};

		const updatedState = reducer( newState, updateAction );
		const newSettingsProducts = updatedState[ siteId ].settings.products;
		expect( newSettingsProducts.length ).to.equal( 4 );
		const ribs = find( newSettingsProducts, { id: 'chicken-and-ribs' } );
		expect( ribs.value ).to.equal( '10' );
		const bbq = find( newSettingsProducts, { id: 'yummy-bbq' } );
		expect( bbq.value ).to.equal( 'YAS' );
	} );

	test( 'should change the settings in store', () => {
		const siteId = 123;
		const settings = [
			{
				id: 'some-setting',
				value: 'yes',
			},
		];
		const action = {
			type: WOOCOMMERCE_SETTINGS_PRODUCTS_REQUEST_SUCCESS,
			siteId,
			data: settings,
		};
		const newState = reducer( {}, action );

		const changeAction = {
			type: WOOCOMMERCE_SETTINGS_PRODUCTS_CHANGE_SETTING,
			siteId,
			data: {
				update: [
					{
						id: 'some-setting',
						value: 'no',
					},
				],
			},
		};

		const updatedState = reducer( newState, changeAction );
		const newSettingsProducts = updatedState[ siteId ].settings.products;
		expect( newSettingsProducts.length ).to.equal( 1 );
		const bbq = find( newSettingsProducts, { id: 'some-setting' } );
		expect( bbq.value ).to.equal( 'no' );
	} );

	test( 'should mark the settings products tree as "loading"', () => {
		const siteId = 123;
		const action = {
			type: WOOCOMMERCE_SETTINGS_PRODUCTS_REQUEST,
			siteId,
		};

		const newSiteData = reducer( {}, action );
		expect( newSiteData[ siteId ].settings.products ).to.eql( LOADING );
	} );

	test( 'should store data from the action', () => {
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

	test( 'should store only product data from the action on batch', () => {
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
