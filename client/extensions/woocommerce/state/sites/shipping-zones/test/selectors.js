/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { getAPIShippingZones, areShippingZonesLoaded, areShippingZonesLoading } from '../selectors';
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
					shippingZones: LOADING,
				},
			},
		},
	},
};
const loadingMethodsState = {
	extensions: {
		woocommerce: {
			sites: {
				123: {
					shippingZones: [
						{ id: 1, methodIds: [ 3 ] },
						{ id: 2, methodIds: LOADING },
					],
				},
			},
		},
	},
};
const loadedWithMethodsState = {
	extensions: {
		woocommerce: {
			sites: {
				123: {
					shippingZones: [
						{ id: 1, methodIds: [ 3 ] },
						{ id: 2, methodIds: [ 7, 42 ] },
					],
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
	describe( '#areShippingZonesLoading', () => {
		it( 'when woocommerce state is not available.', () => {
			expect( areShippingZonesLoading( preInitializedState, 123 ) ).to.be.false;
		} );

		it( 'when zones are loaded.', () => {
			expect( areShippingZonesLoading( loadedEmptyState, 123 ) ).to.be.false;
		} );

		it( 'when zones are loaded but some methods are not.', () => {
			expect( areShippingZonesLoading( loadingMethodsState, 123 ) ).to.be.true;
		} );

		it( 'when zones are loaded and all methods are loaded too.', () => {
			expect( areShippingZonesLoading( loadedWithMethodsState, 123 ) ).to.be.false;
		} );

		it( 'when zones are currently being fetched.', () => {
			expect( areShippingZonesLoading( loadingState, 123 ) ).to.be.true;
		} );

		it( 'when zones are loaded only for a different site.', () => {
			expect( areShippingZonesLoading( loadedEmptyState, 456 ) ).to.be.false;
		} );

		it( 'should get the siteId from the UI tree if not provided.', () => {
			expect( areShippingZonesLoading( loadingStateWithUi ) ).to.be.true;
		} );
	} );

	describe( '#areShippingZonesLoaded', () => {
		it( 'when woocommerce state is not available.', () => {
			expect( areShippingZonesLoaded( preInitializedState, 123 ) ).to.be.false;
		} );

		it( 'when zones are loaded.', () => {
			expect( areShippingZonesLoaded( loadedEmptyState, 123 ) ).to.be.true;
		} );

		it( 'when zones are loaded but some methods are not.', () => {
			expect( areShippingZonesLoaded( loadingMethodsState, 123 ) ).to.be.false;
		} );

		it( 'when zones are loaded and all methods are loaded too.', () => {
			expect( areShippingZonesLoaded( loadedWithMethodsState, 123 ) ).to.be.true;
		} );

		it( 'when zones are currently being fetched.', () => {
			expect( areShippingZonesLoaded( loadingState, 123 ) ).to.be.false;
		} );

		it( 'when zones are loaded only for a different site.', () => {
			expect( areShippingZonesLoaded( loadedEmptyState, 456 ) ).to.be.false;
		} );

		it( 'should get the siteId from the UI tree if not provided.', () => {
			expect( areShippingZonesLoaded( loadingStateWithUi ) ).to.be.false;
		} );
	} );

	describe( '#getAPIShippingZones', () => {
		it( 'when woocommerce state is not available.', () => {
			expect( getAPIShippingZones( preInitializedState, 123 ) ).to.be.falsey;
		} );

		it( 'when zones are loaded.', () => {
			expect( getAPIShippingZones( loadedEmptyState, 123 ) ).to.deep.equal( [] );
		} );

		it( 'when zones are currently being fetched.', () => {
			expect( getAPIShippingZones( loadingState, 123 ) ).to.equal( LOADING );
		} );

		it( 'when zones are loaded only for a different site.', () => {
			expect( getAPIShippingZones( loadedEmptyState, 456 ) ).to.be.falsey;
		} );

		it( 'should get the siteId from the UI tree if not provided.', () => {
			expect( getAPIShippingZones( loadingStateWithUi ) ).to.deep.equal( LOADING );
		} );
	} );
} );
