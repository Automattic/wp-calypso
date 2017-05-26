/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { areSettingsGeneralLoaded, areSettingsGeneralLoading } from '../selectors';
import { LOADING } from '../reducer';

describe( 'selectors', () => {
	describe( 'settings general loading state', () => {
		it( 'when woocommerce state is not available.', () => {
			const state = {
				extensions: {
					woocommerce: {},
				},
			};

			expect( areSettingsGeneralLoaded( state, 123 ) ).to.be.false;
			expect( areSettingsGeneralLoading( state, 123 ) ).to.be.false;
		} );

		it( 'when settings are loaded.', () => {
			const state = {
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

			expect( areSettingsGeneralLoaded( state, 123 ) ).to.be.true;
			expect( areSettingsGeneralLoading( state, 123 ) ).to.be.false;
		} );

		it( 'when settings are currently being fetched.', () => {
			const state = {
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

			expect( areSettingsGeneralLoaded( state, 123 ) ).to.be.false;
			expect( areSettingsGeneralLoading( state, 123 ) ).to.be.true;
		} );

		it( 'when settings are loaded only for a different site.', () => {
			const state = {
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

			expect( areSettingsGeneralLoaded( state, 456 ) ).to.be.false;
			expect( areSettingsGeneralLoading( state, 456 ) ).to.be.false;
		} );

		it( 'should get the siteId from the UI tree if not provided when state is loading.', () => {
			const stateLoading = {
				extensions: {
					woocommerce: {
						wcApi: {
							123: {
								settingsGeneral: LOADING,
							},
						},
					},
				},
				ui: {
					selectedSiteId: 123,
				},
			};

			expect( areSettingsGeneralLoaded( stateLoading ) ).to.be.false;
			expect( areSettingsGeneralLoading( stateLoading ) ).to.be.true;
		} );

		it( 'should get the siteId from the UI tree if not provided when state is loaded.', () => {
			const stateLoaded = {
				extensions: {
					woocommerce: {
						wcApi: {
							123: {
								settingsGeneral: [],
							},
						},
					},
				},
				ui: {
					selectedSiteId: 123,
				},
			};

			expect( areSettingsGeneralLoaded( stateLoaded ) ).to.be.true;
			expect( areSettingsGeneralLoading( stateLoaded ) ).to.be.false;
		} );
	} );
} );
