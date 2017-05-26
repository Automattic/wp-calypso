/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { arePaymentMethodsLoaded, arePaymentMethodsLoading } from '../selectors';
import { LOADING } from '../reducer';

describe( 'selectors', () => {
	describe( 'shipping methods loading state', () => {
		it( 'when woocommerce state is not available.', () => {
			const state = {
				extensions: {
					woocommerce: {},
				},
			};

			expect( arePaymentMethodsLoaded( state, 123 ) ).to.be.false;
			expect( arePaymentMethodsLoading( state, 123 ) ).to.be.false;
		} );

		it( 'when methods are loaded.', () => {
			const state = {
				extensions: {
					woocommerce: {
						wcApi: {
							123: {
								paymentMethods: [],
							},
						},
					},
				},
			};

			expect( arePaymentMethodsLoaded( state, 123 ) ).to.be.true;
			expect( arePaymentMethodsLoading( state, 123 ) ).to.be.false;
		} );

		it( 'when methods are currently being fetched.', () => {
			const state = {
				extensions: {
					woocommerce: {
						wcApi: {
							123: {
								paymentMethods: LOADING,
							},
						},
					},
				},
			};

			expect( arePaymentMethodsLoaded( state, 123 ) ).to.be.false;
			expect( arePaymentMethodsLoading( state, 123 ) ).to.be.true;
		} );

		it( 'when methods are loaded only for a different site.', () => {
			const state = {
				extensions: {
					woocommerce: {
						wcApi: {
							123: {
								paymentMethods: [],
							},
						},
					},
				},
			};

			expect( arePaymentMethodsLoaded( state, 456 ) ).to.be.false;
			expect( arePaymentMethodsLoading( state, 456 ) ).to.be.false;
		} );

		it( 'should get the siteId from the UI tree if not provided when methods are loading.', () => {
			const stateLoading = {
				extensions: {
					woocommerce: {
						wcApi: {
							123: {
								paymentMethods: LOADING,
							},
						},
					},
				},
				ui: {
					selectedSiteId: 123,
				},
			};

			expect( arePaymentMethodsLoaded( stateLoading ) ).to.be.false;
			expect( arePaymentMethodsLoading( stateLoading ) ).to.be.true;
		} );

		it( 'should get the siteId from the UI tree if not provided when methods are loaded.', () => {
			const stateLoaded = {
				extensions: {
					woocommerce: {
						wcApi: {
							123: {
								paymentMethods: [],
							},
						},
					},
				},
				ui: {
					selectedSiteId: 123,
				},
			};

			expect( arePaymentMethodsLoaded( stateLoaded ) ).to.be.true;
			expect( arePaymentMethodsLoading( stateLoaded ) ).to.be.false;
		} );
	} );
} );
