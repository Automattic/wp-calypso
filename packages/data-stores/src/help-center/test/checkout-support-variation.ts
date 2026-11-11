/**
 * @jest-environment jsdom
 */

import { dispatch, select } from '@wordpress/data';
import { register } from '../index';
import type { CheckoutSupportVariation, HelpCenterOptions, HelpCenterShowOptions } from '../types';

const storeKey = register();

const storeSelect = select( storeKey ) as unknown as {
	getCheckoutSupportVariation: () => CheckoutSupportVariation | undefined;
	getHasPremiumSupport: () => boolean;
	getHelpCenterOptions: () => HelpCenterOptions;
};
const storeDispatch = dispatch( storeKey ) as unknown as {
	setShowHelpCenter: ( show: boolean, options?: HelpCenterShowOptions ) => Promise< unknown >;
};

const openFromCheckout = ( checkoutSupportVariation: CheckoutSupportVariation ) =>
	storeDispatch.setShowHelpCenter( true, {
		hasPremiumSupport: false,
		hideBackButton: false,
		contextTerm: '',
		checkoutSupportVariation,
	} );

describe( 'checkout support variation', () => {
	beforeEach( async () => {
		window.localStorage.clear();
		// Start each test from a Help Center opened outside checkout.
		await storeDispatch.setShowHelpCenter( true );
	} );

	it( 'is set when the Help Center opens from checkout', async () => {
		await openFromCheckout( 'hybrid' );

		expect( storeSelect.getCheckoutSupportVariation() ).toBe( 'hybrid' );
	} );

	it( 'stays set when the Help Center closes', async () => {
		await openFromCheckout( 'human_only' );
		await storeDispatch.setShowHelpCenter( false );

		expect( storeSelect.getCheckoutSupportVariation() ).toBe( 'human_only' );
	} );

	it.each( [
		[ 'control', false ],
		[ 'human_only', true ],
		[ 'hybrid', true ],
	] as const )( 'the %s variation grants premium support: %s', async ( variation, expected ) => {
		await openFromCheckout( variation );

		expect( storeSelect.getHasPremiumSupport() ).toBe( expected );
	} );

	it( 'is cleared, with its premium support, when the Help Center opens from anywhere else', async () => {
		await openFromCheckout( 'human_only' );
		await storeDispatch.setShowHelpCenter( true );

		expect( storeSelect.getCheckoutSupportVariation() ).toBeUndefined();
		expect( storeSelect.getHasPremiumSupport() ).toBe( false );
	} );

	it( 'stays out of the merged Help Center options', async () => {
		await openFromCheckout( 'hybrid' );

		expect( storeSelect.getHelpCenterOptions() ).not.toHaveProperty( 'checkoutSupportVariation' );
	} );
} );
