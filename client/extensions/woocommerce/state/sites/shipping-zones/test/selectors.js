/**
 * External dependencies
 */
import { expect } from 'chai';
import sinon from 'sinon';

/**
 * Internal dependencies
 */
import { getAPIShippingZones, areShippingZonesLoaded, areShippingZonesLoading } from '../selectors';
import { LOADING } from 'woocommerce/state/constants';
import * as plugins from 'woocommerce/state/selectors/plugins';

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
					shippingZones: LOADING,
				},
			},
		},
	},
};

const loadingMethodsAndLoadingLocationsState = {
	extensions: {
		woocommerce: {
			sites: {
				123: {
					shippingZones: [
						{ id: 1, methodIds: [ 3 ] },
						{ id: 2, methodIds: LOADING },
					],
					shippingZoneLocations: {
						1: LOADING,
						2: { country: [], continent: [], state: [], postcode: [] },
					},
				},
			},
		},
	},
};

const loadedWithMethodsAndLoadingLocationsState = {
	extensions: {
		woocommerce: {
			sites: {
				123: {
					shippingZones: [
						{ id: 1, methodIds: [ 3 ] },
						{ id: 2, methodIds: [ 7, 42 ] },
					],
					shippingZoneLocations: {
						1: LOADING,
						2: { country: [], continent: [], state: [], postcode: [] },
					},
				},
			},
		},
	},
};

const loadingMethodsAndLoadedLocationsState = {
	extensions: {
		woocommerce: {
			sites: {
				123: {
					shippingZones: [
						{ id: 1, methodIds: [ 3 ] },
						{ id: 2, methodIds: LOADING },
					],
					shippingZoneLocations: {
						1: { country: [], continent: [], state: [], postcode: [] },
						2: { country: [], continent: [], state: [], postcode: [] },
					},
				},
			},
		},
	},
};

const loadedWithMethodsAndLocationsState = {
	extensions: {
		woocommerce: {
			sites: {
				123: {
					shippingZones: [
						{ id: 1, methodIds: [ 3 ] },
						{ id: 2, methodIds: [ 7, 42 ] },
					],
					shippingZoneLocations: {
						1: { country: [], continent: [], state: [], postcode: [] },
						2: { country: [], continent: [], state: [], postcode: [] },
					},
				},
			},
		},
	},
};

const loadedEmptyState = {
	extensions: {
		woocommerce: {
			sites: {
				123: {
					shippingZones: [],
				},
			},
		},
	},
};

const loadingStateWithUi = { ...loadingState, ui: { selectedSiteId: 123 } };

describe( 'selectors', () => {
	let wcsEnabledStub;
	beforeEach( () => {
		wcsEnabledStub = sinon.stub( plugins, 'isWcsEnabled' ).returns( false );
	} );

	afterEach( () => {
		wcsEnabledStub.restore();
	} );

	describe( '#areShippingZonesLoading', () => {
		test( 'should return false when woocommerce state is not available.', () => {
			expect( areShippingZonesLoading( preInitializedState, 123 ) ).to.be.false;
		} );

		test( 'should return false when zones are loaded.', () => {
			expect( areShippingZonesLoading( loadedEmptyState, 123 ) ).to.be.false;
		} );

		test( 'should return true when zones are loaded but some methods and locations are not.', () => {
			expect( areShippingZonesLoading( loadingMethodsAndLoadingLocationsState, 123 ) ).to.be.true;
		} );

		test( 'should return true when zones and methods are loaded but some locations are not.', () => {
			expect( areShippingZonesLoading( loadedWithMethodsAndLoadingLocationsState, 123 ) ).to.be
				.true;
		} );

		test( 'should return true when zones and locations are loaded but some methods are not.', () => {
			expect( areShippingZonesLoading( loadingMethodsAndLoadedLocationsState, 123 ) ).to.be.true;
		} );

		test( 'should return false when zones are loaded and all methods and locations are loaded too.', () => {
			expect( areShippingZonesLoading( loadedWithMethodsAndLocationsState, 123 ) ).to.be.false;
		} );

		test( 'should return true when zones are currently being fetched.', () => {
			expect( areShippingZonesLoading( loadingState, 123 ) ).to.be.true;
		} );

		test( 'should return false when zones are loaded only for a different site.', () => {
			expect( areShippingZonesLoading( loadedEmptyState, 456 ) ).to.be.false;
		} );

		test( 'should get the siteId from the UI tree if not provided.', () => {
			expect( areShippingZonesLoading( loadingStateWithUi ) ).to.be.true;
		} );
	} );

	describe( '#areShippingZonesLoaded', () => {
		test( 'should return false when woocommerce state is not available.', () => {
			expect( areShippingZonesLoaded( preInitializedState, 123 ) ).to.be.false;
		} );

		test( 'should return true when zones are loaded.', () => {
			expect( areShippingZonesLoaded( loadedEmptyState, 123 ) ).to.be.true;
		} );

		test( 'should return false when zones are loaded but some methods and locations are not.', () => {
			expect( areShippingZonesLoaded( loadingMethodsAndLoadingLocationsState, 123 ) ).to.be.false;
		} );

		test( 'should return false when zones and methods are loaded but some locations are not.', () => {
			expect( areShippingZonesLoaded( loadedWithMethodsAndLoadingLocationsState, 123 ) ).to.be
				.false;
		} );

		test( 'should return false when zones and locations are loaded but some methods are not.', () => {
			expect( areShippingZonesLoaded( loadingMethodsAndLoadedLocationsState, 123 ) ).to.be.false;
		} );

		test( 'should return true when zones are loaded and all methods and locations are loaded too.', () => {
			expect( areShippingZonesLoaded( loadedWithMethodsAndLocationsState, 123 ) ).to.be.true;
		} );

		test( 'should return false when zones are currently being fetched.', () => {
			expect( areShippingZonesLoaded( loadingState, 123 ) ).to.be.false;
		} );

		test( 'should return false when zones are loaded only for a different site.', () => {
			expect( areShippingZonesLoaded( loadedEmptyState, 456 ) ).to.be.false;
		} );

		test( 'should get the siteId from the UI tree if not provided.', () => {
			expect( areShippingZonesLoaded( loadingStateWithUi ) ).to.be.false;
		} );
	} );

	describe( '#getAPIShippingZones', () => {
		test( 'should return null when woocommerce state is not available.', () => {
			expect( getAPIShippingZones( preInitializedState, 123 ) ).to.be.undefined;
		} );

		test( 'should return the shipping zones list if they finished loading.', () => {
			expect( getAPIShippingZones( loadedEmptyState, 123 ) ).to.deep.equal( [] );
		} );

		test( 'should return "LOADING" if the zones are currently being fetched.', () => {
			expect( getAPIShippingZones( loadingState, 123 ) ).to.equal( LOADING );
		} );

		test( 'should return null when zones are loaded only for a different site.', () => {
			expect( getAPIShippingZones( loadedEmptyState, 456 ) ).to.be.undefined;
		} );

		test( 'should get the siteId from the UI tree if not provided.', () => {
			expect( getAPIShippingZones( loadingStateWithUi ) ).to.deep.equal( LOADING );
		} );
	} );
} );
