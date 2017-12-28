/** @format */

/**
 * External dependencies
 */
import { expect } from 'chai';
import { noop } from 'lodash';
import { spy, match } from 'sinon';

/**
 * Internal dependencies
 */
import { fetchSettingsGeneral } from '../actions';
import {
	handleSettingsGeneral,
	handleSettingsGeneralSuccess,
	handleSettingsGeneralError,
} from '../handlers';
import { WPCOM_HTTP_REQUEST } from 'client/state/action-types';
import { WOOCOMMERCE_SETTINGS_GENERAL_RECEIVE } from 'client/extensions/woocommerce/state/action-types';

const settingsData = [
	{
		id: 'woocommerce_default_country',
		label: 'Base location',
		description:
			'This is the base location for your business. Tax rates will be based on this country.',
		type: 'select',
		default: 'GB',
		tip: 'This is the base location for your business. Tax rates will be based on this country.',
		value: 'US:MA',
		options: {},
	},
];

describe( 'handlers', () => {
	describe( '#handleSettingsGeneral()', () => {
		test( 'should dispatch a get action', () => {
			const siteId = '123';
			const getState = () => ( {
				extensions: {
					woocommerce: {
						sites: {
							[ siteId ]: {
								settings: {
									general: null,
								},
							},
						},
					},
				},
			} );
			const dispatch = spy();
			const action = fetchSettingsGeneral( siteId );

			handleSettingsGeneral( { dispatch, getState }, action, noop );
			expect( dispatch ).to.have.been.calledWith(
				match( {
					type: WPCOM_HTTP_REQUEST,
					method: 'GET',
					path: `/jetpack-blogs/${ siteId }/rest-api/`,
					query: {
						path: '/wc/v3/settings/general&_method=GET',
						json: true,
						apiVersion: '1.1',
					},
				} )
			);
		} );
		test( 'should not dispatch if settings are already loaded for this site', () => {
			const siteId = '123';
			const getState = () => ( {
				extensions: {
					woocommerce: {
						sites: {
							[ siteId ]: {
								settings: {
									general: settingsData,
								},
							},
						},
					},
				},
			} );
			const dispatch = spy();
			const action = fetchSettingsGeneral( siteId );

			handleSettingsGeneral( { dispatch, getState }, action );
			expect( dispatch ).to.not.have.beenCalled;
		} );
	} );
	describe( '#handleSettingsGeneralSuccess()', () => {
		test( 'should dispatch success with settings data', () => {
			const siteId = '123';
			const store = {
				dispatch: spy(),
			};
			const response = { data: settingsData };

			const action = fetchSettingsGeneral( siteId );
			handleSettingsGeneralSuccess( store, action, response );

			expect( store.dispatch ).calledWith( {
				type: WOOCOMMERCE_SETTINGS_GENERAL_RECEIVE,
				siteId,
				data: settingsData,
			} );
		} );
	} );
	describe( '#handleSettingsGeneralError()', () => {
		test( 'should dispatch error', () => {
			const siteId = '123';
			const store = {
				dispatch: spy(),
			};

			const action = fetchSettingsGeneral( siteId );
			handleSettingsGeneralError( store, action, 'rest_no_route' );

			expect( store.dispatch ).to.have.been.calledWithMatch( {
				type: WOOCOMMERCE_SETTINGS_GENERAL_RECEIVE,
				siteId,
				error: 'rest_no_route',
			} );
		} );
	} );
} );
