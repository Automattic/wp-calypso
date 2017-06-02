/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { areSettingsGeneralLoaded, areSettingsGeneralLoading } from '../selectors';
import { LOADING } from 'woocommerce/state/constants';

const preInitializedState = {
	extensions: {
		woocommerce: {},
	},
};
const loadingState = {
	extensions: {
		woocommerce: {
			wcApi: {
				123: {
					settingsGeneral: LOADING,
				},
			},
		},
	},
};
const loadedState = {
	extensions: {
		woocommerce: {
			wcApi: {
				123: {
					settingsGeneral: [],
				},
			},
		},
	},
};

const loadingStateWithUi = { ...loadingState, ui: { selectedSiteId: 123 } };

describe( 'selectors', () => {
	describe( '#areSettingsGeneralLoaded', () => {
		it( 'when woocommerce state is not available.', () => {
			expect( areSettingsGeneralLoaded( preInitializedState, 123 ) ).to.be.false;
		} );

		it( 'when settings are currently being fetched.', () => {
			expect( areSettingsGeneralLoaded( loadingState, 123 ) ).to.be.false;
		} );

		it( 'when settings are loaded.', () => {
			expect( areSettingsGeneralLoaded( loadedState, 123 ) ).to.be.true;
		} );

		it( 'when settings are loaded only for a different site.', () => {
			expect( areSettingsGeneralLoaded( loadedState, 456 ) ).to.be.false;
		} );

		it( 'should get the siteId from the UI tree if not provided.', () => {
			expect( areSettingsGeneralLoaded( loadingStateWithUi ) ).to.be.false;
		} );
	} );

	describe( '#areSettingsGeneralLoading', () => {
		it( 'when woocommerce state is not available.', () => {
			expect( areSettingsGeneralLoading( preInitializedState, 123 ) ).to.be.false;
		} );

		it( 'when settings are currently being fetched.', () => {
			expect( areSettingsGeneralLoading( loadingState, 123 ) ).to.be.true;
		} );

		it( 'when settings are loaded.', () => {
			expect( areSettingsGeneralLoading( loadedState, 123 ) ).to.be.false;
		} );

		it( 'when settings are loaded only for a different site.', () => {
			expect( areSettingsGeneralLoading( loadedState, 456 ) ).to.be.false;
		} );

		it( 'should get the siteId from the UI tree if not provided.', () => {
			expect( areSettingsGeneralLoading( loadingStateWithUi ) ).to.be.true;
		} );
	} );
} );
