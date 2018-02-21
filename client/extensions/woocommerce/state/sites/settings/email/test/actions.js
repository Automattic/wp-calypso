/** @format */

/**
 * External dependencies
 */
import { expect } from 'chai';
import { spy } from 'sinon';

/**
 * Internal dependencies
 */
import {
	fetchEmailSettings,
	emailSettingChange,
	emailSettingsSaveSettings,
	emailSettingsSubmitSettings,
	emailSettingsInvalidValue,
} from '../actions';
import useNock from 'test/helpers/use-nock';
import {
	WOOCOMMERCE_EMAIL_SETTINGS_REQUEST,
	WOOCOMMERCE_EMAIL_SETTINGS_REQUEST_SUCCESS,
	WOOCOMMERCE_EMAIL_SETTINGS_CHANGE,
	WOOCOMMERCE_EMAIL_SETTINGS_SAVE_SETTINGS,
	WOOCOMMERCE_EMAIL_SETTINGS_SUBMIT,
	WOOCOMMERCE_EMAIL_SETTINGS_SUBMIT_SUCCESS,
	WOOCOMMERCE_EMAIL_SETTINGS_INVALID_VALUE,
} from 'woocommerce/state/action-types';
import { LOADING } from 'woocommerce/state/constants';

describe( 'actions', () => {
	describe( '#fetchEmailSettings()', () => {
		const siteId = '123';

		const data = [
			{
				id: 'woocommerce_email_from_name',
				value: '',
				group_id: 'email',
			},
			{
				id: 'woocommerce_email_from_address',
				value: 'test@test.com',
				group_id: 'email',
			},
			{
				id: 'enabled',
				value: 'yes',
				group_id: 'email_new_order',
			},
			{
				id: 'recipient',
				value: 'admin_1@test.com',
				group_id: 'email_new_order',
			},
			{
				id: 'enabled',
				value: 'yes',
				group_id: 'email_cancelled_order',
			},
			{
				id: 'recipient',
				value: '',
				group_id: 'email_cancelled_order',
			},
			{
				id: 'enabled',
				value: 'yes',
				group_id: 'email_failed_order',
			},
			{
				id: 'recipient',
				value: '',
				group_id: 'email_failed_order',
			},
			{
				id: 'enabled',
				value: 'yes',
				group_id: 'email_customer_on_hold_order',
			},
			{
				id: 'enabled',
				value: 'yes',
				group_id: 'email_customer_processing_order',
			},
			{
				id: 'enabled',
				value: 'yes',
				group_id: 'email_customer_completed_order',
			},
			{
				id: 'enabled',
				value: 'yes',
				group_id: 'email_customer_refunded_order',
			},
			{
				id: 'enabled',
				value: 'yes',
				group_id: 'email_customer_new_account',
			},
		];

		useNock( nock => {
			nock( 'https://public-api.wordpress.com:443' )
				.persist()
				.get( '/rest/v1.1/jetpack-blogs/123/rest-api/' )
				.query( { path: '/wc/v3/settings_email_groups&_via_calypso&_method=get', json: true } )
				.reply( 200, { data } );
		} );

		test( 'should dispatch an request action', () => {
			const getState = () => ( {} );
			const dispatch = spy();
			fetchEmailSettings( siteId )( dispatch, getState );
			expect( dispatch ).to.have.been.calledWith( {
				type: WOOCOMMERCE_EMAIL_SETTINGS_REQUEST,
				siteId,
			} );
		} );

		test( 'should dispatch a success action with settings information when request completes', () => {
			const getState = () => ( {} );
			const dispatch = spy();
			const response = fetchEmailSettings( siteId )( dispatch, getState );

			return response.then( () => {
				expect( dispatch ).to.have.been.calledWith( {
					type: WOOCOMMERCE_EMAIL_SETTINGS_REQUEST_SUCCESS,
					siteId,
					data,
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
									email: LOADING,
								},
							},
						},
					},
				},
			} );
			const dispatch = spy();
			fetchEmailSettings( siteId )( dispatch, getState );
			expect( dispatch ).to.not.have.beenCalled;
		} );

		test( 'should not dispatch if settings are already fetched for this site', () => {
			const getState = () => ( {
				extensions: {
					woocommerce: {
						sites: {
							[ siteId ]: {
								settings: {
									email: data,
								},
							},
						},
					},
				},
			} );
			const dispatch = spy();
			fetchEmailSettings( siteId )( dispatch, getState );
			expect( dispatch ).to.not.have.beenCalled;
		} );
	} );

	describe( '#emailSettingChange()', () => {
		test( 'should dispatch a action with changed setting', () => {
			const dispatch = spy();
			const siteId = 123;
			const setting = { option: true };
			emailSettingChange( siteId, setting )( dispatch );

			expect( dispatch ).to.have.been.calledWith( {
				type: WOOCOMMERCE_EMAIL_SETTINGS_CHANGE,
				siteId,
				setting,
			} );
		} );
	} );

	describe( '#emailSettingsSaveSettings()', () => {
		test( 'should dispatch a action that will trigger saving settings', () => {
			const dispatch = spy();
			const siteId = 123;
			emailSettingsSaveSettings( siteId )( dispatch );

			expect( dispatch ).to.have.been.calledWith( {
				type: WOOCOMMERCE_EMAIL_SETTINGS_SAVE_SETTINGS,
				siteId,
			} );
		} );
	} );

	describe( '#emailSettingsSubmitSettings()', () => {
		const siteId = '123';

		const settings = {
			email: {
				woocommerce_email_from_name: {
					value: 'frtd',
					default: 'wooooooo',
				},
				woocommerce_email_from_address: {
					value: 'bartosz.budzanowski@automattic.com',
					default: 'bartosz.budzanowski@automattic.com',
				},
			},
		};

		const update = [
			{
				id: 'woocommerce_email_from_name',
				value: 'frtd',
				group_id: 'email',
			},
			{
				id: 'woocommerce_email_from_address',
				value: 'test@test.com',
				group_id: 'email',
			},
		];

		const data = { update };

		useNock( nock => {
			nock( 'https://public-api.wordpress.com:443' )
				.persist()
				.post( '/rest/v1.1/jetpack-blogs/123/rest-api/' )
				.query( { path: '/wc/v3/settings_batch&_via_calypso&_method=post', json: true } )
				.reply( 200, { data } );
		} );

		test( 'should dispatch an request action', () => {
			const dispatch = spy();
			emailSettingsSubmitSettings( siteId, settings )( dispatch );
			expect( dispatch ).to.have.been.calledWith( {
				type: WOOCOMMERCE_EMAIL_SETTINGS_SUBMIT,
				siteId,
			} );
		} );

		test( 'should dispatch an success action', () => {
			const dispatch = spy();
			return emailSettingsSubmitSettings( siteId, settings )( dispatch ).then( () => {
				expect( dispatch ).to.have.been.calledWith( {
					type: WOOCOMMERCE_EMAIL_SETTINGS_SUBMIT_SUCCESS,
					siteId,
					update: data,
				} );
			} );
		} );
	} );

	describe( '#emailSettingsInvalidValue()', () => {
		test( 'should dispatch a action that will inform that settings are not valid', () => {
			const dispatch = spy();
			const siteId = 123;
			emailSettingsInvalidValue( siteId, 'Something is wrong!' )( dispatch );

			expect( dispatch ).to.have.been.calledWith( {
				type: WOOCOMMERCE_EMAIL_SETTINGS_INVALID_VALUE,
				siteId,
				reason: 'Something is wrong!',
			} );
		} );
	} );
} );
