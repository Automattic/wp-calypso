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
	getShipToCountrySetting,
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

const shipToCountrySetting = {
	id: 'woocommerce_ship_to_countries',
	label: 'Shipping location(s)',
	type: 'select',
	default: '',
	value: 'disabled',
};

const loadedState = {
	extensions: {
		woocommerce: {
			sites: {
				123: {
					settings: {
						general: [ currencySetting, shipToCountrySetting ],
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

	describe( 'getShipToCountrySetting', () => {
		test( 'should get the setting from state.', () => {
			expect( getShipToCountrySetting( loadedState, 123 ) ).to.eql( shipToCountrySetting );
		} );

		test( 'should get the siteId from the UI tree if not provided.', () => {
			expect( getShipToCountrySetting( loadedStateWithUi ) ).to.eql( shipToCountrySetting );
		} );
	} );
} );
