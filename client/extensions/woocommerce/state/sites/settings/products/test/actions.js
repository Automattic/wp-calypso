/** @format */

/**
 * External dependencies
 */
import { expect } from 'chai';
import { spy } from 'sinon';

/**
 * Internal dependencies
 */
import { fetchSettingsProducts, updateSettingsProducts } from '../actions';
import useNock from 'test/helpers/use-nock';
import {
	WOOCOMMERCE_SETTINGS_PRODUCTS_UPDATE_REQUEST,
	WOOCOMMERCE_SETTINGS_PRODUCTS_UPDATE_REQUEST_SUCCESS,
	WOOCOMMERCE_SETTINGS_PRODUCTS_REQUEST,
	WOOCOMMERCE_SETTINGS_PRODUCTS_REQUEST_SUCCESS,
} from 'woocommerce/state/action-types';
import { LOADING } from 'woocommerce/state/constants';

describe( 'actions', () => {
	describe( '#updateSettingsProducts()', () => {
		const siteId = '123';
		const settingsPayload = [
			{
				id: 'woocommerce_notify_low_stock',
				value: 'no',
			},
			{
				id: 'woocommerce_notify_low_stock_amount',
				value: '7',
			},
		];

		useNock( nock => {
			nock( 'https://public-api.wordpress.com:443' )
				.persist()
				.post( '/rest/v1.1/jetpack-blogs/123/rest-api/' )
				.query( {
					path: '/wc/v3/settings/products/batch&_method=post',
					json: true,
					body: { update: settingsPayload },
				} )
				.reply( 200, {
					data: {
						update: settingsPayload,
					},
				} );
		} );

		test( 'should dispatch an action', () => {
			const getState = () => ( {} );
			const dispatch = spy();
			updateSettingsProducts( siteId, settingsPayload )( dispatch, getState );
			expect( dispatch ).to.have.been.calledWith( {
				type: WOOCOMMERCE_SETTINGS_PRODUCTS_UPDATE_REQUEST,
				data: settingsPayload,
				siteId,
			} );
		} );

		test( 'should dispatch an action for single setting', () => {
			const getState = () => ( {} );
			const singleSetting = { id: 'foo', value: 'yes' };
			const dispatch = spy();
			updateSettingsProducts( siteId, singleSetting )( dispatch, getState );
			expect( dispatch ).to.have.been.calledWith( {
				type: WOOCOMMERCE_SETTINGS_PRODUCTS_UPDATE_REQUEST,
				data: [ singleSetting ],
				siteId,
			} );
		} );

		test( 'should dispatch a success action with updated settings data when request completes', () => {
			const getState = () => ( {} );
			const dispatch = spy();
			const response = updateSettingsProducts( siteId, settingsPayload )( dispatch, getState );

			return response.then( () => {
				expect( dispatch ).to.have.been.calledWith( {
					type: WOOCOMMERCE_SETTINGS_PRODUCTS_UPDATE_REQUEST_SUCCESS,
					siteId,
					data: {
						update: settingsPayload,
					},
				} );
			} );
		} );
	} );

	describe( '#fetchSettingsProducts()', () => {
		const siteId = '123';

		useNock( nock => {
			nock( 'https://public-api.wordpress.com:443' )
				.persist()
				.get( '/rest/v1.1/jetpack-blogs/123/rest-api/' )
				.query( { path: '/wc/v3/settings/products&_method=get', json: true } )
				.reply( 200, {
					data: [
						{
							id: 'woocommerce_weight_unit',
							label: 'Weight unit',
							description: 'This controls what unit you will define weights in.',
							type: 'select',
							default: 'kg',
							tip: 'This controls what unit you will define weights in.',
							value: 'lbs',
							options: {},
						},
					],
				} );
		} );

		test( 'should dispatch an action', () => {
			const getState = () => ( {} );
			const dispatch = spy();
			fetchSettingsProducts( siteId )( dispatch, getState );
			expect( dispatch ).to.have.been.calledWith( {
				type: WOOCOMMERCE_SETTINGS_PRODUCTS_REQUEST,
				siteId,
			} );
		} );

		test( 'should dispatch a success action with settings information when request completes', () => {
			const getState = () => ( {} );
			const dispatch = spy();
			const response = fetchSettingsProducts( siteId )( dispatch, getState );

			return response.then( () => {
				expect( dispatch ).to.have.been.calledWith( {
					type: WOOCOMMERCE_SETTINGS_PRODUCTS_REQUEST_SUCCESS,
					siteId,
					data: [
						{
							id: 'woocommerce_weight_unit',
							label: 'Weight unit',
							description: 'This controls what unit you will define weights in.',
							type: 'select',
							default: 'kg',
							tip: 'This controls what unit you will define weights in.',
							value: 'lbs',
							options: {},
						},
					],
				} );
			} );
		} );

		test( 'should not dispatch if settings are already loading for this site', () => {
			const getState = () => ( {
				extensions: {
					woocommerce: {
						sites: {
							[ siteId ]: {
								settings: {
									products: LOADING,
								},
							},
						},
					},
				},
			} );
			const dispatch = spy();
			fetchSettingsProducts( siteId )( dispatch, getState );
			expect( dispatch ).to.not.have.beenCalled;
		} );
	} );
} );
