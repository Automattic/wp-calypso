/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { getShippingMethods, areShippingMethodsLoaded, areShippingMethodsLoading } from '../selectors';
import { LOADING } from 'woocommerce/state/constants';

describe( 'selectors', () => {
	describe( 'shipping methods loading state', () => {
		it( 'when woocommerce state is not available.', () => {
			const state = {
				extensions: {
					woocommerce: {},
				},
			};

			expect( getShippingMethods( state, 123 ) ).to.be.falsey;
			expect( areShippingMethodsLoaded( state, 123 ) ).to.be.false;
			expect( areShippingMethodsLoading( state, 123 ) ).to.be.false;
		} );

		it( 'when methods are loaded.', () => {
			const state = {
				extensions: {
					woocommerce: {
						sites: {
							123: {
								shippingMethods: [],
							},
						},
					},
				},
			};

			expect( getShippingMethods( state, 123 ) ).to.deep.equal( [] );
			expect( areShippingMethodsLoaded( state, 123 ) ).to.be.true;
			expect( areShippingMethodsLoading( state, 123 ) ).to.be.false;
		} );

		it( 'when methods are currently being fetched.', () => {
			const state = {
				extensions: {
					woocommerce: {
						sites: {
							123: {
								shippingMethods: LOADING,
							},
						},
					},
				},
			};

			expect( getShippingMethods( state, 123 ) ).to.equal( LOADING );
			expect( areShippingMethodsLoaded( state, 123 ) ).to.be.false;
			expect( areShippingMethodsLoading( state, 123 ) ).to.be.true;
		} );

		it( 'when methods are loaded only for a different site.', () => {
			const state = {
				extensions: {
					woocommerce: {
						sites: {
							123: {
								shippingMethods: [],
							},
						},
					},
				},
			};

			expect( getShippingMethods( state, 456 ) ).to.be.falsey;
			expect( areShippingMethodsLoaded( state, 456 ) ).to.be.false;
			expect( areShippingMethodsLoading( state, 456 ) ).to.be.false;
		} );

		it( 'should get the siteId from the UI tree if not provided.', () => {
			const stateLoaded = {
				extensions: {
					woocommerce: {
						sites: {
							123: {
								shippingMethods: [],
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
						sites: {
							123: {
								shippingMethods: LOADING,
							},
						},
					},
				},
				ui: {
					selectedSiteId: 123,
				},
			};

			expect( getShippingMethods( stateLoaded ) ).to.deep.equal( [] );
			expect( areShippingMethodsLoaded( stateLoaded ) ).to.be.true;
			expect( areShippingMethodsLoading( stateLoaded ) ).to.be.false;

			expect( getShippingMethods( stateLoading ) ).to.equal( LOADING );
			expect( areShippingMethodsLoaded( stateLoading ) ).to.be.false;
			expect( areShippingMethodsLoading( stateLoading ) ).to.be.true;
		} );
	} );
} );
