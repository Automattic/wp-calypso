/**
 * External dependencies
 */
import { noop } from 'lodash';

/**
 * Internal dependencies
 */
import { fetchSettingsGeneral } from '../actions';
import {
	handleSettingsGeneral,
	handleSettingsGeneralSuccess,
	handleSettingsGeneralError,
} from '../handlers';
import { WPCOM_HTTP_REQUEST } from 'calypso/state/action-types';
import { WOOCOMMERCE_SETTINGS_GENERAL_RECEIVE } from 'woocommerce/state/action-types';

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
			const dispatch = jest.fn();
			const action = fetchSettingsGeneral( siteId );

			handleSettingsGeneral( action, noop )( dispatch, getState );
			expect( dispatch ).toHaveBeenCalledWith(
				expect.objectContaining( {
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
			const dispatch = jest.fn();
			const action = fetchSettingsGeneral( siteId );

			handleSettingsGeneral( action )( dispatch, getState );
			expect( dispatch ).not.toHaveBeenCalled();
		} );
	} );
	describe( '#handleSettingsGeneralSuccess()', () => {
		test( 'should dispatch success with settings data', () => {
			const siteId = '123';
			const response = { data: settingsData };

			const action = fetchSettingsGeneral( siteId );
			const result = handleSettingsGeneralSuccess( action, response );

			expect( result ).toEqual( {
				type: WOOCOMMERCE_SETTINGS_GENERAL_RECEIVE,
				siteId,
				data: settingsData,
			} );
		} );
	} );
	describe( '#handleSettingsGeneralError()', () => {
		test( 'should dispatch error', () => {
			const siteId = '123';
			const action = fetchSettingsGeneral( siteId );
			const result = handleSettingsGeneralError( action, 'rest_no_route' );

			expect( result ).toEqual( {
				type: WOOCOMMERCE_SETTINGS_GENERAL_RECEIVE,
				siteId,
				error: 'rest_no_route',
			} );
		} );
	} );
} );
