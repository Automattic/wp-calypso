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
	getFinishedInstallOfRequiredPlugins,
	getFinishedPageSetup,
	getOptedOutOfShippingSetup,
	getOptedOutofTaxesSetup,
	getSetStoreAddressDuringInitialSetup,
	getTriedCustomizerDuringInitialSetup,
	isDefaultShippingZoneCreated,
	isStoreSetupComplete,
	isTestSite,
	getCheckedTaxSetup,
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
						is_test_site: true,
						finished_initial_setup: true,
						finished_page_setup: true,
						opted_out_of_shipping_setup: true,
						opted_out_of_taxes_setup: true,
						tried_customizer_during_initial_setup: true,
						created_default_shipping_zone: true,
						finished_initial_install_of_required_plugins: true,
						set_store_address_during_initial_setup: true,
						checked_tax_setup: true,
					},
				},
				124: {
					setupChoices: {
						is_test_site: false,
						finished_initial_setup: false,
						finished_page_setup: false,
						opted_out_of_shipping_setup: false,
						opted_out_of_taxes_setup: false,
						tried_customizer_during_initial_setup: false,
						created_default_shipping_zone: false,
						finished_initial_install_of_required_plugins: false,
						set_store_address_during_initial_setup: false,
						checked_tax_setup: false,
					},
				},
			},
		},
	},
};
const loadedStateEmptySettings = {
	extensions: {
		woocommerce: {
			sites: {
				123: {
					setupChoices: {},
				},
			},
		},
	},
};

const loadingStateWithUi = { ...loadingState, ui: { selectedSiteId: 123 } };
const loadedStateWithUi = { ...loadedState, ui: { selectedSiteId: 123 } };

describe( 'selectors', () => {
	describe( '#areSetupChoicesLoaded', () => {
		test( 'should be false when woocommerce state is not available.', () => {
			expect( areSetupChoicesLoaded( preInitializedState, 123 ) ).to.be.false;
		} );

		test( 'should be false when setup choices are currently being fetched.', () => {
			expect( areSetupChoicesLoaded( loadingState, 123 ) ).to.be.false;
		} );

		test( 'should be true when setup choices are loaded.', () => {
			expect( areSetupChoicesLoaded( loadedState, 123 ) ).to.be.true;
		} );

		test( 'should be false when setup choices object is empty.', () => {
			expect( areSetupChoicesLoaded( loadedStateEmptySettings, 123 ) ).to.be.false;
		} );

		test( 'should be false when setup choices are loaded only for a different site.', () => {
			expect( areSetupChoicesLoaded( loadedState, 456 ) ).to.be.false;
		} );

		test( 'should get the siteId from the UI tree if not provided.', () => {
			expect( areSetupChoicesLoaded( loadingStateWithUi ) ).to.be.false;
		} );
	} );

	describe( '#areSetupChoicesLoading', () => {
		test( 'should be false when woocommerce state is not available.', () => {
			expect( areSetupChoicesLoading( preInitializedState, 123 ) ).to.be.false;
		} );

		test( 'should be true when setup choices are currently being fetched.', () => {
			expect( areSetupChoicesLoading( loadingState, 123 ) ).to.be.true;
		} );

		test( 'should be false when setup choices are loaded.', () => {
			expect( areSetupChoicesLoading( loadedState, 123 ) ).to.be.false;
		} );

		test( 'should be false when setup choices are loaded only for a different site.', () => {
			expect( areSetupChoicesLoading( loadedState, 456 ) ).to.be.false;
		} );

		test( 'should get the siteId from the UI tree if not provided.', () => {
			expect( areSetupChoicesLoading( loadingStateWithUi ) ).to.be.true;
		} );
	} );

	describe( '#getFinishedInitialSetup', () => {
		test( 'should get whether initial setup was completed from the state (123-true).', () => {
			expect( getFinishedInitialSetup( loadedState, 123 ) ).to.eql( true );
		} );

		test( 'should get whether initial setup was completed from the state (124-false).', () => {
			expect( getFinishedInitialSetup( loadedState, 124 ) ).to.eql( false );
		} );

		test( 'should get the siteId from the UI tree if not provided.', () => {
			expect( getFinishedInitialSetup( loadedStateWithUi ) ).to.eql( true );
		} );
	} );

	describe( '#getOptedOutOfShippingSetup', () => {
		test( 'should get whether initial setup was completed from the state (123-true).', () => {
			expect( getOptedOutOfShippingSetup( loadedState, 123 ) ).to.eql( true );
		} );

		test( 'should get whether initial setup was completed from the state (124-false).', () => {
			expect( getOptedOutOfShippingSetup( loadedState, 124 ) ).to.eql( false );
		} );

		test( 'should get the siteId from the UI tree if not provided.', () => {
			expect( getOptedOutOfShippingSetup( loadedStateWithUi ) ).to.eql( true );
		} );
	} );

	describe( '#getOptedOutofTaxesSetup', () => {
		test( 'should get whether initial setup was completed from the state (123-true).', () => {
			expect( getOptedOutofTaxesSetup( loadedState, 123 ) ).to.eql( true );
		} );

		test( 'should get whether initial setup was completed from the state (124-false).', () => {
			expect( getOptedOutofTaxesSetup( loadedState, 124 ) ).to.eql( false );
		} );

		test( 'should get the siteId from the UI tree if not provided.', () => {
			expect( getOptedOutofTaxesSetup( loadedStateWithUi ) ).to.eql( true );
		} );
	} );

	describe( '#getTriedCustomizerDuringInitialSetup', () => {
		test( 'should get whether initial setup was completed from the state (123-true).', () => {
			expect( getTriedCustomizerDuringInitialSetup( loadedState, 123 ) ).to.eql( true );
		} );

		test( 'should get whether initial setup was completed from the state (124-false).', () => {
			expect( getTriedCustomizerDuringInitialSetup( loadedState, 124 ) ).to.eql( false );
		} );

		test( 'should get the siteId from the UI tree if not provided.', () => {
			expect( getTriedCustomizerDuringInitialSetup( loadedStateWithUi ) ).to.eql( true );
		} );
	} );

	describe( '#isDefaultShippingZoneCreated', () => {
		test( 'should get whether initial setup was completed from the state (123-true).', () => {
			expect( isDefaultShippingZoneCreated( loadedState, 123 ) ).to.eql( true );
		} );

		test( 'should get whether initial setup was completed from the state (124-false).', () => {
			expect( isDefaultShippingZoneCreated( loadedState, 124 ) ).to.eql( false );
		} );

		test( 'should get the siteId from the UI tree if not provided.', () => {
			expect( isDefaultShippingZoneCreated( loadedStateWithUi ) ).to.eql( true );
		} );
	} );

	describe( '#getFinishedInstallOfRequiredPlugins', () => {
		test( 'should get whether initial setup was completed from the state (123-true).', () => {
			expect( getFinishedInstallOfRequiredPlugins( loadedState, 123 ) ).to.eql( true );
		} );

		test( 'should get whether initial setup was completed from the state (124-false).', () => {
			expect( getFinishedInstallOfRequiredPlugins( loadedState, 124 ) ).to.eql( false );
		} );

		test( 'should get the siteId from the UI tree if not provided.', () => {
			expect( getFinishedInstallOfRequiredPlugins( loadedStateWithUi ) ).to.eql( true );
		} );
	} );

	describe( '#getFinishedPageSetup', () => {
		test( 'should get whether initial setup was completed from the state (123-true).', () => {
			expect( getFinishedPageSetup( loadedState, 123 ) ).to.eql( true );
		} );

		test( 'should get whether initial setup was completed from the state (124-false).', () => {
			expect( getFinishedPageSetup( loadedState, 124 ) ).to.eql( false );
		} );

		test( 'should get the siteId from the UI tree if not provided.', () => {
			expect( getFinishedPageSetup( loadedStateWithUi ) ).to.eql( true );
		} );
	} );

	describe( '#getCheckedTaxSetup', () => {
		test( 'should get whether taxes were checked during setup from the state (123-true).', () => {
			expect( getCheckedTaxSetup( loadedState, 123 ) ).to.eql( true );
		} );

		test( 'should get whether whether taxes were checked during setup from the state (124-false).', () => {
			expect( getCheckedTaxSetup( loadedState, 124 ) ).to.eql( false );
		} );

		test( 'should get the siteId from the UI tree if not provided.', () => {
			expect( getCheckedTaxSetup( loadedStateWithUi ) ).to.eql( true );
		} );
	} );

	describe( '#getSetStoreAddressDuringInitialSetup', () => {
		test( 'should get whether initial setup was completed from the state (123-true).', () => {
			expect( getSetStoreAddressDuringInitialSetup( loadedState, 123 ) ).to.eql( true );
		} );

		test( 'should get whether initial setup was completed from the state (124-false).', () => {
			expect( getSetStoreAddressDuringInitialSetup( loadedState, 124 ) ).to.eql( false );
		} );

		test( 'should get the siteId from the UI tree if not provided.', () => {
			expect( getSetStoreAddressDuringInitialSetup( loadedStateWithUi ) ).to.eql( true );
		} );
	} );

	describe( '#isStoreSetupComplete', () => {
		test( 'should get whether store setup was completed from the state (123-true).', () => {
			expect( isStoreSetupComplete( loadedState, 123 ) ).to.eql( true );
		} );

		test( 'should get whether store setup was completed from the state (124-false).', () => {
			expect( isStoreSetupComplete( loadedState, 124 ) ).to.eql( false );
		} );

		test( 'should get the siteId from the UI tree if not provided.', () => {
			expect( getSetStoreAddressDuringInitialSetup( loadedStateWithUi ) ).to.eql( true );
		} );
	} );

	describe( '#isTestSite', () => {
		test( 'should get whether initial setup was completed from the state (123-true).', () => {
			expect( isTestSite( loadedState, 123 ) ).to.eql( true );
		} );

		test( 'should get whether initial setup was completed from the state (124-false).', () => {
			expect( isTestSite( loadedState, 124 ) ).to.eql( false );
		} );

		test( 'should get the siteId from the UI tree if not provided.', () => {
			expect( isTestSite( loadedStateWithUi ) ).to.eql( true );
		} );
	} );
} );
