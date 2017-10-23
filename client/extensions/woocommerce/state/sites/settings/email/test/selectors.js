/** @format */

/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import {
	hasMailChimpConnection,
	isApiKeyCorrect,
	isRequestingSettings,
	isSavingSettings,
	isSubmittingApiKey,
	mailChimpSettings,
	requestingSettingsError,
} from '../selectors';

const settings = {
	mailchimp_api_key: '6e46d288s16',
	mailchimp_debugging: false,
	mailchimp_account_info_id: '64c5b43c4',
	mailchimp_account_info_username: 'ski',
	active_tab: 'sync',
	store_name: 'wooooooo',
	store_street: 'Hawthorne 150 ',
	store_city: 'San Francisco',
	store_state: 'CO',
	store_postal_code: '90250',
	store_country: 'US',
	store_phone: '12345678',
	store_locale: 'en',
	store_timezone: 'America/New_York',
	store_currency_code: 'USD',
	admin_email: 'bartosz@gmail.com',
	campaign_from_name: 'wooooooo',
	campaign_from_email: 'store@gmail.com',
	campaign_subject: 'wooooooo',
	campaign_language: 'en',
	campaign_permission_reminder: 'You were subscribed to the newsletter from wooooooo',
	mailchimp_list: '633be793c8',
	newsletter_label: 'Subscribe to our newsletter',
	mailchimp_auto_subscribe: '0',
	mailchimp_checkbox_defaults: 'check',
	mailchimp_checkbox_action: 'woocommerce_after_checkout_billing_form',
	mailchimp_active_tab: 'api_key',
};

const wrongKeyResponse = {
	mailchimp_api_key: '',
	mailchimp_debugging: false,
	mailchimp_account_info_id: '',
	mailchimp_account_info_username: '',
};

const emailState = {
	extensions: {
		woocommerce: {
			sites: {
				123: {
					settings: {
						email: {
							settings,
							settingsRequest: false,
							settingsRequestError: false,
							syncStatus: {
								last_updated_time: '2017-10-17T22:22:44',
								store_syncing: false,
								mailchimp_total_products: 32,
								product_count: 32,
								mailchimp_total_orders: 1,
								order_count: 1,
								account_name: 'ski',
								mailchimp_list_name: 'ski',
								store_id: 'a264ea0b6cbbb',
							},
							syncStatusRequest: false,
							syncStatusRequestError: false,
							resyncRequest: false,
							resyncRequestError: false,
							apiKeySubmit: false,
							apiKeySubmitError: false,
							storeInfoSubmit: false,
							storeInfoSubmitError: false,
							listsRequest: false,
							listsRequestError: false,
							newsletterSettingsSubmit: false,
							newsletterSettingsSubmitError: false,
							saveSettings: false,
						},
					},
				},
			},
		},
	},
};

const loadingSettings = Object.assign( {}, emailState, {
	extensions: {
		woocommerce: {
			sites: {
				123: { settings: { email: { settingsRequest: true } } },
			},
		},
	},
} );

const submittingApiKey = Object.assign( {}, emailState, {
	extensions: {
		woocommerce: {
			sites: {
				123: { settings: { email: { apiKeySubmit: true } } },
			},
		},
	},
} );

const invalidKey = Object.assign( {}, emailState, {
	extensions: {
		woocommerce: {
			sites: {
				123: { settings: { email: { settings: wrongKeyResponse } } },
			},
		},
	},
} );

const mailChimpNoSync = Object.assign( {}, emailState, {
	extensions: {
		woocommerce: {
			sites: {
				123: { settings: { email: { syncStatus: { mailchimp_list_name: 'n/a' } } } },
			},
		},
	},
} );

const mailChimpSaveSettings = Object.assign( {}, emailState, {
	extensions: {
		woocommerce: {
			sites: {
				123: { settings: { email: { saveSettings: true } } },
			},
		},
	},
} );

describe( 'selectors', () => {
	describe( '#isRequestingSettings', () => {
		test( 'should be false when woocommerce state is not available.', () => {
			expect( isRequestingSettings( {}, 123 ) ).to.be.false;
		} );

		test( 'should be false when woocommerce state is loaded and there is no active request.', () => {
			expect( isRequestingSettings( emailState, 123 ) ).to.be.false;
		} );

		test( 'should be true when settings settings are currently being fetched.', () => {
			expect( isRequestingSettings( loadingSettings, 123 ) ).to.be.true;
		} );
	} );

	describe( '#mailChimpSettings', () => {
		test( 'should be empty when woocommerce state is not available.', () => {
			expect( mailChimpSettings( {}, 123 ) ).to.be.deep.equal( {} );
		} );

		test( 'should return settings if they are stored in state.', () => {
			expect( mailChimpSettings( emailState, 123 ) ).to.be.deep.equal( settings );
		} );
	} );

	describe( '#requestingSettingsError', () => {
		test( 'should be null when woocommerce state is not available.', () => {
			expect( requestingSettingsError( {}, 123 ) ).to.be.null;
		} );

		test( 'should be false if settings are stored in the state.', () => {
			expect( requestingSettingsError( emailState, 123 ) ).to.be.false;
		} );
	} );

	describe( '#isSubmittingApiKey', () => {
		test( 'should be false when woocommerce state is not available.', () => {
			expect( isSubmittingApiKey( {}, 123 ) ).to.be.false;
		} );

		test( 'should be false when woocommerce state is loaded and there is no active request.', () => {
			expect( isSubmittingApiKey( emailState, 123 ) ).to.be.false;
		} );

		test( 'should be true when key is being submited.', () => {
			expect( isSubmittingApiKey( submittingApiKey, 123 ) ).to.be.true;
		} );
	} );

	describe( '#isApiKeyCorrect', () => {
		test( 'should be true when woocommerce state is not available.', () => {
			expect( isApiKeyCorrect( {}, 123 ) ).to.be.true;
		} );

		test( 'should be true when mailchimp has valid connection with server.', () => {
			expect( isApiKeyCorrect( emailState, 123 ) ).to.be.true;
		} );

		test( 'should be false after invalid key submit', () => {
			expect( isApiKeyCorrect( invalidKey, 123 ) ).to.be.false;
		} );
	} );

	describe( '#hasMailChimpConnection', () => {
		test( 'should be false when woocommerce state is not available.', () => {
			expect( hasMailChimpConnection( {}, 123 ) ).to.be.false;
		} );

		test( 'should be true when mailchimp has valid connection with server.', () => {
			expect( hasMailChimpConnection( emailState, 123 ) ).to.be.true;
		} );

		test( 'should be false after invalid key submit', () => {
			expect( hasMailChimpConnection( mailChimpNoSync, 123 ) ).to.be.false;
		} );
	} );

	describe( '#isSavingSettings', () => {
		test( 'should be false when woocommerce state is not available.', () => {
			expect( isSavingSettings( {}, 123 ) ).to.be.false;
		} );

		test( 'should be true when user reqested Save action.', () => {
			expect( isSavingSettings( mailChimpSaveSettings, 123 ) ).to.be.true;
		} );

		test( 'should be false when user has not requested Save action', () => {
			expect( isSavingSettings( emailState, 123 ) ).to.be.false;
		} );
	} );
} );
