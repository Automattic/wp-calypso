/** @format */

/**
 * External dependencies
 */
import { expect } from 'chai';
import { spy } from 'sinon';

/**
 * Internal dependencies
 */
import { requestSettings, submitMailChimpApiKey } from '../actions';
import useNock from 'test/helpers/use-nock';
import {
	WOOCOMMERCE_MAILCHIMP_SETTINGS_REQUEST,
	WOOCOMMERCE_MAILCHIMP_SETTINGS_REQUEST_SUCCESS,
	WOOCOMMERCE_MAILCHIMP_API_KEY_SUBMIT,
	WOOCOMMERCE_MAILCHIMP_API_KEY_SUBMIT_SUCCESS,
} from 'woocommerce/state/action-types';

describe( 'actions', () => {
	describe( '#requestSettings()', () => {
		const siteId = '123';

		useNock( nock => {
			nock( 'https://public-api.wordpress.com:443' )
				.persist()
				.get( '/rest/v1.1/jetpack-blogs/123/rest-api/' )
				.query( { path: '/wc/v3/mailchimp&_method=get', json: true } )
				.reply( 200, {
					data: {
						mailchimp_api_key: '6e46d0621d-us16',
						mailchimp_debugging: false,
						mailchimp_account_info_id: '64c533c4',
						mailchimp_account_info_username: 'ski',
						active_tab: 'newsletter_settings',
						store_name: 'sdsd',
						campaign_from_name: 'sdsd',
						campaign_from_email: 'user@gmail.com',
						campaign_subject: 'sdsd',
						campaign_language: 'en',
						campaign_permission_reminder: 'You were subscribed to the newsletter from sdsd.',
						mailchimp_list: '633bwew8',
						newsletter_label: 'Subscribe to our newsletter',
						mailchimp_active_tab: 'sync',
					},
				} );
		} );

		test( 'should dispatch an action', () => {
			const getState = () => ( {} );
			const dispatch = spy();
			requestSettings( siteId )( dispatch, getState );
			expect( dispatch ).to.have.been.calledWith( {
				type: WOOCOMMERCE_MAILCHIMP_SETTINGS_REQUEST,
				siteId,
			} );
		} );

		test( 'should dispatch a success action with settings information when request completes', () => {
			const getState = () => ( {} );
			const dispatch = spy();
			const response = requestSettings( siteId )( dispatch, getState );

			return response.then( () => {
				expect( dispatch ).to.have.been.calledWith( {
					type: WOOCOMMERCE_MAILCHIMP_SETTINGS_REQUEST_SUCCESS,
					siteId,
					settings: {
						mailchimp_api_key: '6e46d0621d-us16',
						mailchimp_debugging: false,
						mailchimp_account_info_id: '64c533c4',
						mailchimp_account_info_username: 'ski',
						active_tab: 'newsletter_settings',
						store_name: 'sdsd',
						campaign_from_name: 'sdsd',
						campaign_from_email: 'user@gmail.com',
						campaign_subject: 'sdsd',
						campaign_language: 'en',
						campaign_permission_reminder: 'You were subscribed to the newsletter from sdsd.',
						mailchimp_list: '633bwew8',
						newsletter_label: 'Subscribe to our newsletter',
						mailchimp_active_tab: 'sync',
					},
				} );
			} );
		} );
	} );

	describe( '#submitMailChimpApiKey()', () => {
		const siteId = '123';

		useNock( nock => {
			nock( 'https://public-api.wordpress.com:443' )
				.persist()
				.post( '/rest/v1.1/jetpack-blogs/123/rest-api/' )
				.query( { path: '/wc/v3/mailchimp/api_key&_method=put', json: true } )
				.reply( 200, {
					data: {
						mailchimp_api_key: '12345testing',
						mailchimp_debugging: false,
						mailchimp_account_info_id: '64c533c4',
						mailchimp_account_info_username: 'ski',
						mailchimp_active_tab: 'store_info',
					},
				} );
		} );

		test( 'should dispatch an action', () => {
			const getState = () => ( {} );
			const dispatch = spy();
			const api_key = '12345testing';
			submitMailChimpApiKey( siteId, api_key )( dispatch, getState );
			expect( dispatch ).to.have.been.calledWith( {
				type: WOOCOMMERCE_MAILCHIMP_API_KEY_SUBMIT,
				siteId,
			} );
		} );

		test( 'should dispatch a success action with settings information when request completes', () => {
			const getState = () => ( {} );
			const dispatch = spy();
			const api_key = '12345testing';
			const response = submitMailChimpApiKey( siteId, api_key )( dispatch, getState );

			return response.then( () => {
				expect( dispatch ).to.have.been.calledWith( {
					type: WOOCOMMERCE_MAILCHIMP_API_KEY_SUBMIT_SUCCESS,
					siteId,
					settings: {
						mailchimp_api_key: '12345testing',
						mailchimp_debugging: false,
						mailchimp_account_info_id: '64c533c4',
						mailchimp_account_info_username: 'ski',
						mailchimp_active_tab: 'store_info',
					},
				} );
			} );
		} );
	} );
} );
