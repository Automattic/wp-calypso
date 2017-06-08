/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import {
	areSetupChoicesLoaded,
	areSetupChoicesLoading,
	getFinishedInitialSetup,
} from '../selectors';
import { LOADING } from 'woocommerce/state/constants';

const preInitializedState = {
	extensions: {
		woocommerce: {},
	},
};
const loadingState = {
	extensions: {
		woocommerce: {
			sites: {
				123: {
					setupChoices: LOADING,
				},
			},
		},
	},
};
const loadedState = {
	extensions: {
		woocommerce: {
			sites: {
				123: {
					setupChoices: {
						finished_initial_setup: true,
						opted_out_of_shipping_setup: true,
						opted_out_of_taxes_setup: true,
						tried_customizer_during_initial_setup: true,
					},
				},
			},
		},
	},
};

const loadingStateWithUi = { ...loadingState, ui: { selectedSiteId: 123 } };
const loadedStateWithUi = { ...loadedState, ui: { selectedSiteId: 123 } };

describe( 'selectors', () => {
	describe( '#areSetupChoicesLoaded', () => {
		it( 'should be false when woocommerce state is not available.', () => {
			expect( areSetupChoicesLoaded( preInitializedState, 123 ) ).to.be.false;
		} );

		it( 'should be false when setup choices are currently being fetched.', () => {
			expect( areSetupChoicesLoaded( loadingState, 123 ) ).to.be.false;
		} );

		it( 'should be true when setup choices are loaded.', () => {
			expect( areSetupChoicesLoaded( loadedState, 123 ) ).to.be.true;
		} );

		it( 'should be false when settings are loaded only for a different site.', () => {
			expect( areSetupChoicesLoaded( loadedState, 456 ) ).to.be.false;
		} );

		it( 'should get the siteId from the UI tree if not provided.', () => {
			expect( areSetupChoicesLoaded( loadingStateWithUi ) ).to.be.false;
		} );
	} );

	describe( '#areSetupChoicesLoading', () => {
		it( 'should be false when woocommerce state is not available.', () => {
			expect( areSetupChoicesLoading( preInitializedState, 123 ) ).to.be.false;
		} );

		it( 'should be true when setup choices are currently being fetched.', () => {
			expect( areSetupChoicesLoading( loadingState, 123 ) ).to.be.true;
		} );

		it( 'should be false when setup choices are loaded.', () => {
			expect( areSetupChoicesLoading( loadedState, 123 ) ).to.be.false;
		} );

		it( 'should be false when setup choices are loaded only for a different site.', () => {
			expect( areSetupChoicesLoading( loadedState, 456 ) ).to.be.false;
		} );

		it( 'should get the siteId from the UI tree if not provided.', () => {
			expect( areSetupChoicesLoading( loadingStateWithUi ) ).to.be.true;
		} );
	} );

	describe( '#getFinishedInitialSetup', () => {
		it( 'should get whether initial setup was completed from the state.', () => {
			expect( getFinishedInitialSetup( loadedState, 123 ) ).to.eql( true );
		} );

		it( 'should get the siteId from the UI tree if not provided.', () => {
			expect( getFinishedInitialSetup( loadedStateWithUi ) ).to.eql( true );
		} );
	} );
} );
