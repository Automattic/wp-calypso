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
	areShippingZonesLocationsValid,
} from '../selectors';
import { LOADING } from 'woocommerce/state/constants';
import { createState } from 'woocommerce/state/test/helpers';

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
		test( 'should return false when woocommerce state is not available.', () => {
			expect( areShippingZoneLocationsLoaded( emptyState, zoneId, 123 ) ).to.be.undefined;
		} );

		test( 'should return true when zone locations are loaded.', () => {
			expect( areShippingZoneLocationsLoaded( loadedState, zoneId, 123 ) ).to.be.true;
		} );

		test( 'should return false when zone locations are currently being fetched.', () => {
			expect( areShippingZoneLocationsLoaded( loadingState, zoneId, 123 ) ).to.be.false;
		} );

		test( 'should return false when zone locations are loaded only for a different site.', () => {
			expect( areShippingZoneLocationsLoaded( loadedState, zoneId, 456 ) ).to.be.undefined;
		} );

		test( 'should return false when zone locations are loaded only for a different zone.', () => {
			expect( areShippingZoneLocationsLoaded( loadedState, 42, 123 ) ).to.be.false;
		} );

		test( 'should get the siteId from the UI tree if not provided.', () => {
			expect( areShippingZoneLocationsLoaded( loadedState, zoneId ) ).to.be.true;
		} );
	} );

	describe( '#areShippingZoneLocationsLoading', () => {
		test( 'should return false when woocommerce state is not available.', () => {
			expect( areShippingZoneLocationsLoading( emptyState, zoneId, 123 ) ).to.be.undefined;
		} );

		test( 'should return false when zone locations are loaded.', () => {
			expect( areShippingZoneLocationsLoading( loadedState, zoneId, 123 ) ).to.be.false;
		} );

		test( 'should return true when zone locations are currently being fetched.', () => {
			expect( areShippingZoneLocationsLoading( loadingState, zoneId, 123 ) ).to.be.true;
		} );

		test( 'should return false when zone locations are being loaded only for a different site.', () => {
			expect( areShippingZoneLocationsLoading( loadingState, zoneId, 456 ) ).to.be.undefined;
		} );

		test( 'should return false when zone locations are being loaded only for a different zone.', () => {
			expect( areShippingZoneLocationsLoading( loadingState, 42, 123 ) ).to.be.false;
		} );

		test( 'should get the siteId from the UI tree if not provided.', () => {
			expect( areShippingZoneLocationsLoading( loadingState, zoneId ) ).to.be.true;
		} );
	} );

	describe( '#areShippingZonesLocationsValid', () => {
		test( 'should return true if the zones locations are still loading.', () => {
			expect( areShippingZonesLocationsValid( loadingState ) ).to.be.true;
		} );

		test( 'should return true for an empty zone list.', () => {
			const state = createState( {
				site: {
					shippingZoneLocations: {},
				},
				ui: {},
			} );
			expect( areShippingZonesLocationsValid( state ) ).to.be.true;
		} );

		test( 'should return true for the "Locations not covered by your other zones" zone.', () => {
			const state = createState( {
				site: {
					shippingZoneLocations: {
						0: {
							continent: [],
							country: [],
							state: [],
							postcode: [],
						},
					},
				},
				ui: {},
			} );
			expect( areShippingZonesLocationsValid( state ) ).to.be.true;
		} );

		test( 'should return true for a zone without locations.', () => {
			const state = createState( {
				site: {
					shippingZoneLocations: {
						1: {
							continent: [],
							country: [],
							state: [],
							postcode: [],
						},
					},
				},
				ui: {},
			} );
			expect( areShippingZonesLocationsValid( state ) ).to.be.true;
		} );

		test( 'should return true for a zone with a single continent.', () => {
			const state = createState( {
				site: {
					shippingZoneLocations: {
						1: {
							continent: [ 'NA' ],
							country: [],
							state: [],
							postcode: [],
						},
					},
				},
				ui: {},
			} );
			expect( areShippingZonesLocationsValid( state ) ).to.be.true;
		} );

		test( 'should return true for a zone with multiple continents.', () => {
			const state = createState( {
				site: {
					shippingZoneLocations: {
						1: {
							continent: [ 'NA', 'EU' ],
							country: [],
							state: [],
							postcode: [],
						},
					},
				},
				ui: {},
			} );
			expect( areShippingZonesLocationsValid( state ) ).to.be.true;
		} );

		test( 'should return false for zones that have repeated continents.', () => {
			const state = createState( {
				site: {
					shippingZoneLocations: {
						1: {
							continent: [ 'NA', 'EU' ],
							country: [],
							state: [],
							postcode: [],
						},
						2: {
							continent: [ 'EU' ],
							country: [],
							state: [],
							postcode: [],
						},
					},
				},
				ui: {},
			} );
			expect( areShippingZonesLocationsValid( state ) ).to.be.false;
		} );

		test( 'should return false for a zone that mixes continents and countries.', () => {
			const state = createState( {
				site: {
					shippingZoneLocations: {
						1: {
							continent: [ 'NA' ],
							country: [ 'UK' ],
							state: [],
							postcode: [],
						},
					},
				},
				ui: {},
			} );
			expect( areShippingZonesLocationsValid( state ) ).to.be.false;
		} );

		test( 'should return false for a zone that mixes continents and states.', () => {
			const state = createState( {
				site: {
					shippingZoneLocations: {
						1: {
							continent: [ 'NA' ],
							country: [],
							state: [ 'US:CA' ],
							postcode: [],
						},
					},
				},
				ui: {},
			} );
			expect( areShippingZonesLocationsValid( state ) ).to.be.false;
		} );

		test( 'should return false for a zone that mixes continents and postcodes.', () => {
			const state = createState( {
				site: {
					shippingZoneLocations: {
						1: {
							continent: [ 'NA' ],
							country: [],
							state: [],
							postcode: [ '12345' ],
						},
					},
				},
				ui: {},
			} );
			expect( areShippingZonesLocationsValid( state ) ).to.be.false;
		} );

		test( 'should return true for a zone with a single country.', () => {
			const state = createState( {
				site: {
					shippingZoneLocations: {
						1: {
							continent: [],
							country: [ 'US' ],
							state: [],
							postcode: [],
						},
					},
				},
				ui: {},
			} );
			expect( areShippingZonesLocationsValid( state ) ).to.be.true;
		} );

		test( 'should return true for a zone with multiple countries.', () => {
			const state = createState( {
				site: {
					shippingZoneLocations: {
						1: {
							continent: [],
							country: [ 'US', 'CA' ],
							state: [],
							postcode: [],
						},
					},
				},
				ui: {},
			} );
			expect( areShippingZonesLocationsValid( state ) ).to.be.true;
		} );

		test( 'should return false for zones that have repeated countries.', () => {
			const state = createState( {
				site: {
					shippingZoneLocations: {
						1: {
							continent: [],
							country: [ 'US', 'UK' ],
							state: [],
							postcode: [],
						},
						2: {
							continent: [],
							country: [ 'US', 'CA' ],
							state: [],
							postcode: [],
						},
					},
				},
				ui: {},
			} );
			expect( areShippingZonesLocationsValid( state ) ).to.be.false;
		} );

		test( 'should return false for a zone that mixes countries and states.', () => {
			const state = createState( {
				site: {
					shippingZoneLocations: {
						1: {
							continent: [],
							country: [ 'US' ],
							state: [ 'US:CA' ],
							postcode: [],
						},
					},
				},
				ui: {},
			} );
			expect( areShippingZonesLocationsValid( state ) ).to.be.false;
		} );

		test( 'should return true for a zone with a single state.', () => {
			const state = createState( {
				site: {
					shippingZoneLocations: {
						1: {
							continent: [],
							country: [],
							state: [ 'US:CA' ],
							postcode: [],
						},
					},
				},
				ui: {},
			} );
			expect( areShippingZonesLocationsValid( state ) ).to.be.true;
		} );

		test( 'should return true for a zone with multiple states from the same country.', () => {
			const state = createState( {
				site: {
					shippingZoneLocations: {
						1: {
							continent: [],
							country: [],
							state: [ 'US:UT', 'US:CA', 'US:NY' ],
							postcode: [],
						},
					},
				},
				ui: {},
			} );
			expect( areShippingZonesLocationsValid( state ) ).to.be.true;
		} );

		test( 'should return false for a zone with multiple states from different countries.', () => {
			const state = createState( {
				site: {
					shippingZoneLocations: {
						1: {
							continent: [],
							country: [],
							state: [ 'US:UT', 'US:CA', 'CA:BC' ],
							postcode: [],
						},
					},
				},
				ui: {},
			} );
			expect( areShippingZonesLocationsValid( state ) ).to.be.false;
		} );

		test( 'should return false for zones that have repeated states.', () => {
			const state = createState( {
				site: {
					shippingZoneLocations: {
						1: {
							continent: [],
							country: [],
							state: [ 'US:UT', 'US:CA' ],
							postcode: [],
						},
						2: {
							continent: [],
							country: [],
							state: [ 'US:CA', 'US:NY' ],
							postcode: [],
						},
					},
				},
				ui: {},
			} );
			expect( areShippingZonesLocationsValid( state ) ).to.be.false;
		} );

		test( 'should return false for a zone that mixes states and postcodes.', () => {
			const state = createState( {
				site: {
					shippingZoneLocations: {
						1: {
							continent: [],
							country: [],
							state: [ 'US:CA' ],
							postcode: [ '80123' ],
						},
					},
				},
				ui: {},
			} );
			expect( areShippingZonesLocationsValid( state ) ).to.be.false;
		} );

		test( 'should return false for a zone that has only a postcode, without country.', () => {
			const state = createState( {
				site: {
					shippingZoneLocations: {
						1: {
							continent: [],
							country: [],
							state: [],
							postcode: [ '80123' ],
						},
					},
				},
				ui: {},
			} );
			expect( areShippingZonesLocationsValid( state ) ).to.be.false;
		} );

		test( 'should return false for a zone that has a postcode with several countries.', () => {
			const state = createState( {
				site: {
					shippingZoneLocations: {
						1: {
							continent: [],
							country: [ 'US', 'CA' ],
							state: [],
							postcode: [ '80100...80199' ],
						},
					},
				},
				ui: {},
			} );
			expect( areShippingZonesLocationsValid( state ) ).to.be.false;
		} );

		test( 'should return true for a zone that has a postcode with a country.', () => {
			const state = createState( {
				site: {
					shippingZoneLocations: {
						1: {
							continent: [],
							country: [ 'US' ],
							state: [],
							postcode: [ '80100...80199' ],
						},
					},
				},
				ui: {},
			} );
			expect( areShippingZonesLocationsValid( state ) ).to.be.true;
		} );

		test( 'should return false for a zone that has multiple postcodes.', () => {
			const state = createState( {
				site: {
					shippingZoneLocations: {
						1: {
							continent: [],
							country: [ 'US' ],
							state: [],
							postcode: [ '80123', '12345' ],
						},
					},
				},
				ui: {},
			} );
			expect( areShippingZonesLocationsValid( state ) ).to.be.false;
		} );

		test( 'should return false even if only a single zone is incorrect.', () => {
			const state = createState( {
				site: {
					shippingZoneLocations: {
						1: {
							continent: [],
							country: [ 'US' ],
							state: [],
							postcode: [ '80123' ],
						},
						2: {
							continent: [ 'NA' ],
							country: [],
							state: [],
							postcode: [],
						},
						3: {
							// wrong!
							continent: [],
							country: [ 'US' ],
							state: [ 'US:CA' ],
							postcode: [ '80123' ],
						},
					},
				},
				ui: {},
			} );
			expect( areShippingZonesLocationsValid( state ) ).to.be.false;
		} );
	} );
} );
