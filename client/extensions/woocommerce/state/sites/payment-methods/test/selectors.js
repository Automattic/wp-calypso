/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { arePaymentMethodsLoaded, arePaymentMethodsLoading } from '../selectors';
import { LOADING } from 'woocommerce/state/constants';

const preInitializedState = {
	extensions: {
		woocommerce: {},
	},
};
const loadingState = {
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
const loadedState = {
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

const loadingStateWithUi = { ...loadingState, ui: { selectedSiteId: 123 } };

describe( 'selectors', () => {
	describe( '#arePaymentMethodsLoading', () => {
		it( 'when woocommerce state is not available.', () => {
			expect( arePaymentMethodsLoading( preInitializedState, 123 ) ).to.be.false;
		} );

		it( 'when methods are loaded.', () => {
			expect( arePaymentMethodsLoading( loadedState, 123 ) ).to.be.false;
		} );

		it( 'when methods are currently being fetched.', () => {
			expect( arePaymentMethodsLoading( loadingState, 123 ) ).to.be.true;
		} );

		it( 'when methods are loaded only for a different site.', () => {
			expect( arePaymentMethodsLoading( loadedState, 456 ) ).to.be.false;
		} );

		it( 'should get the siteId from the UI tree if not provided when methods are loading.', () => {
			expect( arePaymentMethodsLoading( loadingStateWithUi ) ).to.be.true;
		} );
	} );

	describe( '#arePaymentMethodsLoaded', () => {
		it( 'when woocommerce state is not available.', () => {
			expect( arePaymentMethodsLoaded( preInitializedState, 123 ) ).to.be.false;
		} );

		it( 'when methods are loaded.', () => {
			expect( arePaymentMethodsLoaded( loadedState, 123 ) ).to.be.true;
		} );

		it( 'when methods are currently being fetched.', () => {
			expect( arePaymentMethodsLoaded( loadingState, 123 ) ).to.be.false;
		} );

		it( 'when methods are loaded only for a different site.', () => {
			expect( arePaymentMethodsLoaded( loadedState, 456 ) ).to.be.false;
		} );

		it( 'should get the siteId from the UI tree if not provided when methods are loading.', () => {
			expect( arePaymentMethodsLoaded( loadingStateWithUi ) ).to.be.false;
		} );
	} );
} );
