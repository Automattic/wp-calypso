/**
 * External dependencies
 */
import { expect } from 'chai';
import { spy } from 'sinon';

/**
 * Internal dependencies
 */
import { fetchSettingsGeneral } from '../actions';
import { LOADING } from 'woocommerce/state/constants';
import useNock from 'test/helpers/use-nock';
import { useSandbox } from 'test/helpers/use-sinon';
import {
	WOOCOMMERCE_API_FETCH_SETTINGS_GENERAL,
	WOOCOMMERCE_API_FETCH_SETTINGS_GENERAL_SUCCESS,
} from 'woocommerce/state/action-types';

describe( 'actions', () => {
	describe( '#fetchSettingsGeneral()', () => {
		const siteId = '123';

		useSandbox();
		useNock( ( nock ) => {
			nock( 'https://public-api.wordpress.com:443' )
				.persist()
				.get( '/rest/v1.1/jetpack-blogs/123/rest-api/' )
				.query( { path: '/wc/v2/settings/general' } )
				.reply( 200, {
					data: [ {
						id: 'woocommerce_default_country',
						label: 'Base location',
						description: 'This is the base location for your business. Tax rates will be based on this country.',
						type: 'select',
						'default': 'GB',
						tip: 'This is the base location for your business. Tax rates will be based on this country.',
						value: 'US:MA',
						options: {},
					} ]
				} );
		} );

		it( 'should dispatch an action', () => {
			const getState = () => ( {} );
			const dispatch = spy();
			fetchSettingsGeneral( siteId )( dispatch, getState );
			expect( dispatch ).to.have.been.calledWith( { type: WOOCOMMERCE_API_FETCH_SETTINGS_GENERAL, siteId } );
		} );

		it( 'should dispatch a success action with settings information when request completes', () => {
			const getState = () => ( {} );
			const dispatch = spy();
			const response = fetchSettingsGeneral( siteId )( dispatch, getState );

			return response.then( () => {
				expect( dispatch ).to.have.been.calledWith( {
					type: WOOCOMMERCE_API_FETCH_SETTINGS_GENERAL_SUCCESS,
					siteId,
					data: [ {
						id: 'woocommerce_default_country',
						label: 'Base location',
						description: 'This is the base location for your business. Tax rates will be based on this country.',
						type: 'select',
						'default': 'GB',
						tip: 'This is the base location for your business. Tax rates will be based on this country.',
						value: 'US:MA',
						options: {},
					} ]
				} );
			} );
		} );

		it( 'should not dispatch if settings are already loading for this site', () => {
			const getState = () => ( {
				extensions: {
					woocommerce: {
						wcApi: {
							[ siteId ]: {
								settingsGeneral: LOADING
							}
						}
					}
				}
			} );
			const dispatch = spy();
			fetchSettingsGeneral( siteId )( dispatch, getState );
			expect( dispatch ).to.not.have.beenCalled;
		} );
	} );
} );
