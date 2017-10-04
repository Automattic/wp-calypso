/** @format */
/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import {
	arePaymentMethodsLoaded,
	arePaymentMethodsLoading,
	getPaymentMethods,
	getPaymentMethod,
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
					paymentMethods: LOADING,
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
					paymentMethods: [
						{
							id: 'bacs',
							title: 'Direct bank transfer',
							description: 'Make your payment directly into our bank account.',
							enabled: false,
							method_title: 'BACS',
							methodType: 'offline',
							method_description:
								'Allows payments by BACS, more commonly known as direct bank/wire transfer.',
						},
					],
				},
			},
		},
	},
};

const loadingStateWithUi = { ...loadingState, ui: { selectedSiteId: 123 } };

describe( 'selectors', () => {
	describe( '#arePaymentMethodsLoading', () => {
		it( 'should be false when woocommerce state is not available.', () => {
			expect( arePaymentMethodsLoading( preInitializedState, 123 ) ).to.be.false;
		} );

		it( 'should be false when methods are loaded.', () => {
			expect( arePaymentMethodsLoading( loadedState, 123 ) ).to.be.false;
		} );

		it( 'should be true when methods are currently being fetched.', () => {
			expect( arePaymentMethodsLoading( loadingState, 123 ) ).to.be.true;
		} );

		it( 'should be false when methods are loaded only for a different site.', () => {
			expect( arePaymentMethodsLoading( loadedState, 456 ) ).to.be.false;
		} );

		it( 'should use the siteId in the UI tree if not provided.', () => {
			expect( arePaymentMethodsLoading( loadingStateWithUi ) ).to.be.true;
		} );
	} );

	describe( '#arePaymentMethodsLoaded', () => {
		it( 'should be false when woocommerce state is not available.', () => {
			expect( arePaymentMethodsLoaded( preInitializedState, 123 ) ).to.be.false;
		} );

		it( 'should be true when methods are loaded.', () => {
			expect( arePaymentMethodsLoaded( loadedState, 123 ) ).to.be.true;
		} );

		it( 'should be false when methods are currently being fetched.', () => {
			expect( arePaymentMethodsLoaded( loadingState, 123 ) ).to.be.false;
		} );

		it( 'should be false when methods are loaded only for a different site.', () => {
			expect( arePaymentMethodsLoaded( loadedState, 456 ) ).to.be.false;
		} );

		it( 'should use the siteId in the UI tree if not provided.', () => {
			expect( arePaymentMethodsLoaded( loadingStateWithUi ) ).to.be.false;
		} );
	} );

	describe( '#getPaymentMethods', () => {
		it( 'should return paymentMethods when given populated state tree.', () => {
			expect( getPaymentMethods( loadedState, 123 ) ).to.deep.equal(
				loadedState.extensions.woocommerce.sites[ 123 ].paymentMethods
			);
		} );

		it( 'should return LOADING constant when given a loading state tree.', () => {
			expect( getPaymentMethods( loadingState, 123 ) ).to.deep.equal( 'LOADING' );
		} );

		it( 'should return undefined when given a pre-initialized state tree.', () => {
			expect( getPaymentMethods( preInitializedState, 123 ) ).to.be.undefined;
		} );
	} );

	describe( '#getPaymentMethod', () => {
		it( 'should return the requested paymentMethod when given populated state tree.', () => {
			expect( getPaymentMethod( loadedState, 'bacs', 123 ) ).to.eql( {
				id: 'bacs',
				title: 'Direct bank transfer',
				description: 'Make your payment directly into our bank account.',
				enabled: false,
				method_title: 'BACS',
				methodType: 'offline',
				method_description:
					'Allows payments by BACS, more commonly known as direct bank/wire transfer.',
			} );
		} );

		it( 'should be false when given a loading state tree.', () => {
			expect( getPaymentMethod( loadingState, 'bacs', 123 ) ).to.be.false;
		} );

		it( 'should be false when given a pre-initialized state tree.', () => {
			expect( getPaymentMethod( preInitializedState, 'bacs', 123 ) ).to.be.false;
		} );
	} );
} );
