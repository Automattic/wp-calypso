/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import {
	areShippingZoneLocationsLoaded,
	areShippingZoneLocationsLoading,
} from '../selectors';
import { LOADING } from 'woocommerce/state/constants';

const zoneId = 7;

const loadedState = {
	extensions: {
		woocommerce: {
			sites: {
				123: {
					shippingZoneLocations: {
						[ zoneId ]: {
							continent: [],
							country: [],
							state: [],
							postcode: [],
						},
					},
				},
			},
		},
	},
	ui: {
		selectedSiteId: 123,
	},
};

const loadingState = {
	extensions: {
		woocommerce: {
			sites: {
				123: {
					shippingZoneLocations: {
						[ zoneId ]: LOADING,
					},
				},
			},
		},
	},
	ui: {
		selectedSiteId: 123,
	},
};

const emptyState = {
	extensions: {
		woocommerce: {},
	},
	ui: {
		selectedSiteId: 123,
	},
};

describe( 'selectors', () => {
	describe( '#areShippingZoneLocationsLoaded', () => {
		it( 'should return false when woocommerce state is not available.', () => {
			expect( areShippingZoneLocationsLoaded( emptyState, zoneId, 123 ) ).to.be.falsey;
		} );

		it( 'should return true when zone locations are loaded.', () => {
			expect( areShippingZoneLocationsLoaded( loadedState, zoneId, 123 ) ).to.be.true;
		} );

		it( 'should return false when zone locations are currently being fetched.', () => {
			expect( areShippingZoneLocationsLoaded( loadingState, zoneId, 123 ) ).to.be.false;
		} );

		it( 'should return false when zone locations are loaded only for a different site.', () => {
			expect( areShippingZoneLocationsLoaded( loadedState, zoneId, 456 ) ).to.be.falsey;
		} );

		it( 'should return false when zone locations are loaded only for a different zone.', () => {
			expect( areShippingZoneLocationsLoaded( loadedState, 42, 123 ) ).to.be.false;
		} );

		it( 'should get the siteId from the UI tree if not provided.', () => {
			expect( areShippingZoneLocationsLoaded( loadedState, zoneId ) ).to.be.true;
		} );
	} );

	describe( '#areShippingZoneLocationsLoading', () => {
		it( 'should return false when woocommerce state is not available.', () => {
			expect( areShippingZoneLocationsLoading( emptyState, zoneId, 123 ) ).to.be.falsey;
		} );

		it( 'should return false when zone locations are loaded.', () => {
			expect( areShippingZoneLocationsLoading( loadedState, zoneId, 123 ) ).to.be.false;
		} );

		it( 'should return true when zone locations are currently being fetched.', () => {
			expect( areShippingZoneLocationsLoading( loadingState, zoneId, 123 ) ).to.be.true;
		} );

		it( 'should return false when zone locations are being loaded only for a different site.', () => {
			expect( areShippingZoneLocationsLoading( loadingState, zoneId, 456 ) ).to.be.falsey;
		} );

		it( 'should return false when zone locations are being loaded only for a different zone.', () => {
			expect( areShippingZoneLocationsLoading( loadingState, 42, 123 ) ).to.be.false;
		} );

		it( 'should get the siteId from the UI tree if not provided.', () => {
			expect( areShippingZoneLocationsLoading( loadingState, zoneId ) ).to.be.true;
		} );
	} );
} );
