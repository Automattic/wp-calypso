/** @format */

/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { getEmailSettings, areEmailSettingsLoaded, areEmailSettingsLoading } from '../selectors';
import { LOADING } from 'woocommerce/state/constants';

const preInitializedState = {
	extensions: {
		woocommerce: {
			sites: {
				123: {
					settings: {
						email: null,
					},
				},
			},
		},
	},
};

const loadingState = {
	extensions: {
		woocommerce: {
			sites: {
				123: {
					settings: {
						email: LOADING,
					},
				},
			},
		},
	},
};

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
];

const loadedState = {
	extensions: {
		woocommerce: {
			sites: {
				123: {
					settings: {
						email: data,
					},
				},
			},
		},
	},
};

const loadingStateWithUi = { ...loadingState, ui: { selectedSiteId: 123 } };
const loadedStateWithUi = { ...loadedState, ui: { selectedSiteId: 123 } };

describe( 'selectors', () => {
	describe( '#areEmailSettingsLoaded', () => {
		test( 'should be false when woocommerce state is not available.', () => {
			expect( areEmailSettingsLoaded( preInitializedState, 123 ) ).to.be.false;
		} );

		test( 'should be false when email settings are currently being fetched.', () => {
			expect( areEmailSettingsLoaded( loadingState, 123 ) ).to.be.false;
		} );

		test( 'should be true when products settings are loaded.', () => {
			expect( areEmailSettingsLoaded( loadedState, 123 ) ).to.be.true;
		} );

		test( 'should be false when products settings are loaded only for a different site.', () => {
			expect( areEmailSettingsLoaded( loadedState, 456 ) ).to.be.false;
		} );

		test( 'should get the siteId from the UI tree if not provided.', () => {
			expect( areEmailSettingsLoaded( loadingStateWithUi ) ).to.be.false;
		} );
	} );

	describe( '#areEmailSettingsLoading', () => {
		test( 'should be false when woocommerce state is not available.', () => {
			expect( areEmailSettingsLoading( preInitializedState, 123 ) ).to.be.false;
		} );

		test( 'should be true when email settings are currently being fetched.', () => {
			expect( areEmailSettingsLoading( loadingState, 123 ) ).to.be.true;
		} );

		test( 'should be false when emails settings are loaded.', () => {
			expect( areEmailSettingsLoading( loadedState, 123 ) ).to.be.false;
		} );

		test( 'should be false when emails settings are loaded only for a different site.', () => {
			expect( areEmailSettingsLoading( loadedState, 456 ) ).to.be.false;
		} );

		test( 'should get the siteId from the UI tree if not provided.', () => {
			expect( areEmailSettingsLoading( loadingStateWithUi ) ).to.be.true;
		} );
	} );

	describe( '#getEmailSettings', () => {
		test( 'should be null  when woocommerce state is not available.', () => {
			expect( getEmailSettings( preInitializedState, 123 ) ).to.be.null;
		} );

		test( 'should get the email setting from the state.', () => {
			expect( getEmailSettings( loadedState, 123 ) ).to.eql( data );
		} );

		test( 'should get the siteId from the UI tree if not provided.', () => {
			expect( getEmailSettings( loadedStateWithUi ) ).to.eql( data );
		} );
	} );
} );
