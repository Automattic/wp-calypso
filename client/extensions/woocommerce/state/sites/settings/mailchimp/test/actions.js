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
	mailChimpSaveSettings,
	requestSettings,
	requestSyncStatus,
	submitMailChimpApiKey,
	submitMailChimpCampaignDefaults,
	submitMailChimpStoreInfo,
} from '../actions';
import useNock from 'test/helpers/use-nock';
import {
	WOOCOMMERCE_MAILCHIMP_API_KEY_SUBMIT_SUCCESS,
	WOOCOMMERCE_MAILCHIMP_API_KEY_SUBMIT,
	WOOCOMMERCE_MAILCHIMP_CAMPAIGN_DEFAULTS_SUBMIT_SUCCESS,
	WOOCOMMERCE_MAILCHIMP_CAMPAIGN_DEFAULTS_SUBMIT,
	WOOCOMMERCE_MAILCHIMP_SAVE_SETTINGS,
	WOOCOMMERCE_MAILCHIMP_SETTINGS_REQUEST_SUCCESS,
	WOOCOMMERCE_MAILCHIMP_SETTINGS_REQUEST,
	WOOCOMMERCE_MAILCHIMP_STORE_INFO_SUBMIT_SUCCESS,
	WOOCOMMERCE_MAILCHIMP_STORE_INFO_SUBMIT,
	WOOCOMMERCE_MAILCHIMP_SYNC_STATUS_REQUEST_SUCCESS,
	WOOCOMMERCE_MAILCHIMP_SYNC_STATUS_REQUEST,
} from 'woocommerce/state/action-types';

describe( 'actions', () => {
	describe( '#requestSettings()', () => {
		const siteId = '123';

		useNock( nock => {
			nock( 'https://public-api.wordpress.com:443' )
				.persist()
				.get( '/rest/v1.1/jetpack-blogs/123/rest-api/' )
				.query( { path: '/wc/v3/mailchimp&_via_calypso&_method=get', json: true } )
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
				.query( { path: '/wc/v3/mailchimp/api_key&_via_calypso&_method=put', json: true } )
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

	describe( '#submitMailChimpStoreInfo()', () => {
		const siteId = '123';

		useNock( nock => {
			nock( 'https://public-api.wordpress.com:443' )
				.persist()
				.post( '/rest/v1.1/jetpack-blogs/123/rest-api/' )
				.query( { path: '/wc/v3/mailchimp/store_info&_via_calypso&_method=put', json: true } )
				.reply( 200, {
					data: {
						mailchimp_api_key: '12345testing',
						mailchimp_debugging: false,
						mailchimp_account_info_id: '64c533c4',
						mailchimp_account_info_username: 'ski',
						mailchimp_active_tab: 'campaign_defaults',
						store_name: 'mystore',
						store_street: 'street',
						store_city: 'Valhalla',
					},
				} );
		} );

		test( 'should dispatch an action', () => {
			const getState = () => ( {} );
			const dispatch = spy();
			const storeInfo = { store_name: 'mystore' };
			submitMailChimpStoreInfo( siteId, storeInfo )( dispatch, getState );
			expect( dispatch ).to.have.been.calledWith( {
				type: WOOCOMMERCE_MAILCHIMP_STORE_INFO_SUBMIT,
				siteId,
			} );
		} );

		test( 'should dispatch a success action with settings information when request completes', () => {
			const getState = () => ( {} );
			const dispatch = spy();
			const storeInfo = {
				store_name: 'mystore',
				store_street: 'street',
				store_city: 'Valhalla',
			};
			const response = submitMailChimpStoreInfo( siteId, storeInfo )( dispatch, getState );

			return response.then( () => {
				expect( dispatch ).to.have.been.calledWith( {
					type: WOOCOMMERCE_MAILCHIMP_STORE_INFO_SUBMIT_SUCCESS,
					siteId,
					settings: {
						mailchimp_api_key: '12345testing',
						mailchimp_debugging: false,
						mailchimp_account_info_id: '64c533c4',
						mailchimp_account_info_username: 'ski',
						mailchimp_active_tab: 'campaign_defaults',
						store_name: 'mystore',
						store_street: 'street',
						store_city: 'Valhalla',
					},
				} );
			} );
		} );
	} );

	describe( '#submitMailChimpCampaignDefaults()', () => {
		const siteId = '123';

		useNock( nock => {
			nock( 'https://public-api.wordpress.com:443' )
				.persist()
				.post( '/rest/v1.1/jetpack-blogs/123/rest-api/' )
				.query( { path: '/wc/v3/mailchimp/store_info&_via_calypso&_method=put', json: true } )
				.reply( 200, {
					data: {
						mailchimp_api_key: '12345testing',
						mailchimp_debugging: false,
						mailchimp_account_info_id: '64c533c4',
						mailchimp_account_info_username: 'ski',
						mailchimp_active_tab: 'campaign_defaults',
						store_name: 'mystore',
						store_street: 'street',
						store_city: 'Valhalla',
						campaign_from_name: 'woo',
						campaign_from_email: 'mystore@woo.woo',
					},
				} );
		} );

		test( 'should dispatch an action', () => {
			const getState = () => ( {} );
			const dispatch = spy();
			const campaignDefaults = {
				campaign_from_name: 'woo',
				campaign_from_email: 'mystore@woo.woo',
			};
			submitMailChimpCampaignDefaults( siteId, campaignDefaults )( dispatch, getState );
			expect( dispatch ).to.have.been.calledWith( {
				type: WOOCOMMERCE_MAILCHIMP_CAMPAIGN_DEFAULTS_SUBMIT,
				siteId,
			} );
		} );

		test( 'should dispatch a success action with settings information when request completes', () => {
			const getState = () => ( {} );
			const dispatch = spy();
			const campaignDefaults = {
				campaign_from_name: 'woo',
				campaign_from_email: 'mystore@woo.woo',
			};
			const response = submitMailChimpCampaignDefaults( siteId, campaignDefaults )(
				dispatch,
				getState
			);

			return response.then( () => {
				expect( dispatch ).to.have.been.calledWith( {
					type: WOOCOMMERCE_MAILCHIMP_CAMPAIGN_DEFAULTS_SUBMIT_SUCCESS,
					siteId,
					settings: {
						mailchimp_api_key: '12345testing',
						mailchimp_debugging: false,
						mailchimp_account_info_id: '64c533c4',
						mailchimp_account_info_username: 'ski',
						mailchimp_active_tab: 'campaign_defaults',
						store_name: 'mystore',
						store_street: 'street',
						store_city: 'Valhalla',
						campaign_from_name: 'woo',
						campaign_from_email: 'mystore@woo.woo',
					},
				} );
			} );
		} );
	} );

	describe( '#requestSyncStatus()', () => {
		const siteId = '123';

		useNock( nock => {
			nock( 'https://public-api.wordpress.com:443' )
				.persist()
				.get( '/rest/v1.1/jetpack-blogs/123/rest-api/' )
				.query( { path: '/wc/v3/mailchimp/sync&_via_calypso&_method=get', json: true } )
				.reply( 200, {
					data: {
						last_updated_time: '2017-10-17T22:22:44',
						store_syncing: false,
						mailchimp_total_products: 32,
						product_count: 32,
						mailchimp_total_orders: 1,
						order_count: 1,
						account_name: 'ski',
						mailchimp_list_name: 'ski',
						store_id: 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
					},
				} );
		} );

		test( 'should dispatch an action', () => {
			const getState = () => ( {} );
			const dispatch = spy();
			requestSyncStatus( siteId )( dispatch, getState );
			expect( dispatch ).to.have.been.calledWith( {
				type: WOOCOMMERCE_MAILCHIMP_SYNC_STATUS_REQUEST,
				siteId,
			} );
		} );

		test( 'should dispatch a success action with settings information when request completes', () => {
			const getState = () => ( {} );
			const dispatch = spy();
			const response = requestSyncStatus( siteId )( dispatch, getState );

			return response.then( () => {
				expect( dispatch ).to.have.been.calledWith( {
					type: WOOCOMMERCE_MAILCHIMP_SYNC_STATUS_REQUEST_SUCCESS,
					siteId,
					syncStatus: {
						last_updated_time: '2017-10-17T22:22:44',
						store_syncing: false,
						mailchimp_total_products: 32,
						product_count: 32,
						mailchimp_total_orders: 1,
						order_count: 1,
						account_name: 'ski',
						mailchimp_list_name: 'ski',
						store_id: 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
					},
				} );
			} );
		} );
	} );

	describe( '#mailChimpSaveSettings()', () => {
		const siteId = '123';

		test( 'should not dispatch an action if there are not settings in state', () => {
			const getState = () => ( {} );
			const dispatch = spy();
			mailChimpSaveSettings( siteId )( dispatch, getState );
			expect( dispatch ).to.have.not.been.calledWith( {
				type: WOOCOMMERCE_MAILCHIMP_SAVE_SETTINGS,
				siteId,
			} );
		} );

		test( 'should not dispatch an action if the state does not represent completed setup', () => {
			const getState = () => ( {
				extensions: {
					woocommerce: {
						sites: {
							[ siteId ]: {
								settings: {
									mailchimp: {
										settings: {
											mailchimp_api_key: '12345testing',
											mailchimp_debugging: false,
											mailchimp_account_info_id: '64c533c4',
											mailchimp_account_info_username: 'ski',
											mailchimp_active_tab: 'campaign_defaults',
											store_name: 'mystore',
											store_street: 'street',
											store_city: 'Valhalla',
											campaign_from_name: 'woo',
											campaign_from_email: 'mystore@woo.woo',
										},
									},
								},
							},
						},
					},
				},
			} );

			const dispatch = spy();
			mailChimpSaveSettings( siteId )( dispatch, getState );
			expect( dispatch ).to.have.not.been.calledWith( {
				type: WOOCOMMERCE_MAILCHIMP_SAVE_SETTINGS,
				siteId,
			} );
		} );

		test( 'should dispatch an action if the state represents completed setup', () => {
			const getState = () => ( {
				extensions: {
					woocommerce: {
						sites: {
							[ siteId ]: {
								settings: {
									mailchimp: {
										settings: {
											mailchimp_api_key: '6e46d0621d-us16',
											mailchimp_debugging: false,
											mailchimp_account_info_id: '64c533c4',
											mailchimp_account_info_username: 'ski',
											active_tab: 'sync',
											store_name: 'sdsd',
											campaign_from_name: 'sdsd',
											campaign_from_email: 'user@gmail.com',
											campaign_subject: 'sdsd',
											campaign_language: 'en',
											campaign_permission_reminder:
												'You were subscribed to the newsletter from sdsd.',
											mailchimp_list: '633bwew8',
											newsletter_label: 'Subscribe to our newsletter',
											mailchimp_active_tab: 'sync',
										},
									},
								},
							},
						},
					},
				},
			} );

			const dispatch = spy();
			mailChimpSaveSettings( siteId )( dispatch, getState );
			expect( dispatch ).to.have.been.calledWith( {
				type: WOOCOMMERCE_MAILCHIMP_SAVE_SETTINGS,
				siteId,
			} );
		} );
	} );
} );
