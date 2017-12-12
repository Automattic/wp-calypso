/** @format */

/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import {
	areSettingsGeneralLoaded,
	areSettingsGeneralLoading,
	getPaymentCurrencySettings,
	getStoreNotice,
	isStoreNoticeEnabled,
} from '../selectors';
import { LOADING } from 'woocommerce/state/constants';

const preInitializedState = {
	extensions: {
		woocommerce: {
			sites: {
				123: {
					settings: {
						general: null,
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
						general: LOADING,
					},
				},
			},
		},
	},
};
const currencySetting = {
	id: 'woocommerce_currency',
	label: 'Currency',
	type: 'select',
	default: 'GBP',
	value: 'USD',
};
const noticeEnabledSetting = {
	id: 'woocommerce_demo_store',
	label: 'Store notice',
	type: 'checkbox',
	default: 'no',
	value: 'yes',
};
const noticeSetting = {
	id: 'woocommerce_demo_store_notice',
	label: 'Store notice text',
	type: 'textarea',
	default: 'This is a demo store for testing purposes &mdash; no orders shall be fulfilled.',
	value: 'Sale runs through Wednesday, December 13, 2017!',
};
const loadedState = {
	extensions: {
		woocommerce: {
			sites: {
				123: {
					settings: {
						general: [ currencySetting, noticeEnabledSetting, noticeSetting ],
					},
				},
			},
		},
	},
};

const loadingStateWithUi = { ...loadingState, ui: { selectedSiteId: 123 } };
const loadedStateWithUi = { ...loadedState, ui: { selectedSiteId: 123 } };

describe( 'selectors', () => {
	describe( '#areSettingsGeneralLoaded', () => {
		test( 'should be false when woocommerce state is not available.', () => {
			expect( areSettingsGeneralLoaded( preInitializedState, 123 ) ).to.be.false;
		} );

		test( 'should be false when settings are currently being fetched.', () => {
			expect( areSettingsGeneralLoaded( loadingState, 123 ) ).to.be.false;
		} );

		test( 'should be true when settings are loaded.', () => {
			expect( areSettingsGeneralLoaded( loadedState, 123 ) ).to.be.true;
		} );

		test( 'should be false when settings are loaded only for a different site.', () => {
			expect( areSettingsGeneralLoaded( loadedState, 456 ) ).to.be.false;
		} );

		test( 'should get the siteId from the UI tree if not provided.', () => {
			expect( areSettingsGeneralLoaded( loadedStateWithUi ) ).to.be.true;
		} );
	} );

	describe( '#areSettingsGeneralLoading', () => {
		test( 'should be false when woocommerce state is not available.', () => {
			expect( areSettingsGeneralLoading( preInitializedState, 123 ) ).to.be.false;
		} );

		test( 'should be true when settings are currently being fetched.', () => {
			expect( areSettingsGeneralLoading( loadingState, 123 ) ).to.be.true;
		} );

		test( 'should be false when settings are loaded.', () => {
			expect( areSettingsGeneralLoading( loadedState, 123 ) ).to.be.false;
		} );

		test( 'should be false when settings are loaded only for a different site.', () => {
			expect( areSettingsGeneralLoading( loadedState, 456 ) ).to.be.false;
		} );

		test( 'should get the siteId from the UI tree if not provided.', () => {
			expect( areSettingsGeneralLoading( loadingStateWithUi ) ).to.be.true;
		} );
	} );

	describe( '#getPaymentCurrencySettings', () => {
		test( 'should get the currency settings from the state.', () => {
			expect( getPaymentCurrencySettings( loadedState, 123 ) ).to.eql( currencySetting );
		} );

		test( 'should get the siteId from the UI tree if not provided.', () => {
			expect( getPaymentCurrencySettings( loadedStateWithUi ) ).to.eql( currencySetting );
		} );
	} );

	describe( '#isStoreNoticeEnabled', () => {
		test( 'should be false when woocommerce state is not available', () => {
			expect( isStoreNoticeEnabled( preInitializedState, 123 ) ).to.be.false;
		} );

		test( 'should be false when settings are currently being fetched.', () => {
			expect( isStoreNoticeEnabled( loadingState, 123 ) ).to.be.false;
		} );

		test( 'should be true when settings are loaded.', () => {
			expect( isStoreNoticeEnabled( loadedState, 123 ) ).to.be.true;
		} );
	} );

	describe( '#getStoreNotice', () => {
		test( 'should be null when woocommerce state is not available', () => {
			expect( getStoreNotice( preInitializedState, 123 ) ).to.be.null;
		} );

		test( 'should be null when settings are currently being fetched.', () => {
			expect( getStoreNotice( loadingState, 123 ) ).to.be.null;
		} );

		test( 'should get the store notice from state.', () => {
			expect( getStoreNotice( loadedState, 123 ) ).to.eql( noticeSetting.value );
		} );
	} );
} );
