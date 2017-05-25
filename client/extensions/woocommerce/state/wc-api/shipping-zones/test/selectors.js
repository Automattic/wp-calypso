/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { getAPIShippingZones, areShippingZonesLoaded, areShippingZonesLoading } from '../selectors';
import { LOADING } from '../reducer';

describe( 'selectors', () => {
	describe( 'shipping zones loading state', () => {
		it( 'when woocommerce state is not available.', () => {
			const state = {
				extensions: {
					woocommerce: {},
				},
			};

			expect( getAPIShippingZones( state, 123 ) ).to.be.falsey;
			expect( areShippingZonesLoaded( state, 123 ) ).to.be.false;
			expect( areShippingZonesLoading( state, 123 ) ).to.be.false;
		} );

		it( 'when zones are loaded.', () => {
			const state = {
				extensions: {
					woocommerce: {
						wcApi: {
							123: {
								shippingZones: [],
							},
						},
					},
				},
			};

			expect( getAPIShippingZones( state, 123 ) ).to.deep.equal( [] );
			expect( areShippingZonesLoaded( state, 123 ) ).to.be.true;
			expect( areShippingZonesLoading( state, 123 ) ).to.be.false;
		} );

		it( 'when zones are currently being fetched.', () => {
			const state = {
				extensions: {
					woocommerce: {
						wcApi: {
							123: {
								shippingZones: LOADING,
							},
						},
					},
				},
			};

			expect( getAPIShippingZones( state, 123 ) ).to.equal( LOADING );
			expect( areShippingZonesLoaded( state, 123 ) ).to.be.false;
			expect( areShippingZonesLoading( state, 123 ) ).to.be.true;
		} );

		it( 'when zones are loaded only for a different site.', () => {
			const state = {
				extensions: {
					woocommerce: {
						wcApi: {
							123: {
								shippingZones: [],
							},
						},
					},
				},
			};

			expect( getAPIShippingZones( state, 456 ) ).to.be.falsey;
			expect( areShippingZonesLoaded( state, 456 ) ).to.be.false;
			expect( areShippingZonesLoading( state, 456 ) ).to.be.false;
		} );

		it( 'should get the siteId from the UI tree if not provided.', () => {
			const stateLoaded = {
				extensions: {
					woocommerce: {
						wcApi: {
							123: {
								shippingZones: [],
							},
						},
					},
				},
				ui: {
					selectedSiteId: 123,
				},
			};
			const stateLoading = {
				extensions: {
					woocommerce: {
						wcApi: {
							123: {
								shippingZones: LOADING,
							},
						},
					},
				},
				ui: {
					selectedSiteId: 123,
				},
			};

			expect( getAPIShippingZones( stateLoaded ) ).to.deep.equal( [] );
			expect( areShippingZonesLoaded( stateLoaded ) ).to.be.true;
			expect( areShippingZonesLoading( stateLoaded ) ).to.be.false;

			expect( getAPIShippingZones( stateLoading ) ).to.equal( LOADING );
			expect( areShippingZonesLoaded( stateLoading ) ).to.be.false;
			expect( areShippingZonesLoading( stateLoading ) ).to.be.true;
		} );
	} );
} );
