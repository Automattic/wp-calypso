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
const loadedState = {
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
			expect( areShippingZonesLoading( loadedState, 123 ) ).to.be.false;
		} );

		it( 'when zones are currently being fetched.', () => {
			expect( areShippingZonesLoading( loadingState, 123 ) ).to.be.true;
		} );

		it( 'when zones are loaded only for a different site.', () => {
			expect( areShippingZonesLoading( loadedState, 456 ) ).to.be.false;
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
			expect( areShippingZonesLoaded( loadedState, 123 ) ).to.be.true;
		} );

		it( 'when zones are currently being fetched.', () => {
			expect( areShippingZonesLoaded( loadingState, 123 ) ).to.be.false;
		} );

		it( 'when zones are loaded only for a different site.', () => {
			expect( areShippingZonesLoaded( loadedState, 456 ) ).to.be.false;
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
			expect( getAPIShippingZones( loadedState, 123 ) ).to.deep.equal( [] );
		} );

		it( 'when zones are currently being fetched.', () => {
			expect( getAPIShippingZones( loadingState, 123 ) ).to.equal( LOADING );
		} );

		it( 'when zones are loaded only for a different site.', () => {
			expect( getAPIShippingZones( loadedState, 456 ) ).to.be.falsey;
		} );

		it( 'should get the siteId from the UI tree if not provided.', () => {
			expect( getAPIShippingZones( loadingStateWithUi ) ).to.deep.equal( LOADING );
		} );
	} );
} );
