/**
 * @format
 * @jest-environment jsdom
 */

/**
 * External dependencies
 */

/**
 * Internal dependencies
 */
import { isEbanxEnabledForCountry, isValidCPF } from '../ebanx';
import { isPaymentMethodEnabled } from 'lib/cart-values';

jest.mock( 'lib/cart-values', () => {
	const cartValues = {};

	cartValues.isPaymentMethodEnabled = jest.fn( false, false );

	return cartValues;
} );

describe( 'Ebanx payment processing methods', () => {
	describe( 'isEbanxEnabledForCountry', () => {
		beforeAll( () => {
			isPaymentMethodEnabled.mockReturnValue( true );
		} );
		afterAll( () => {
			isPaymentMethodEnabled.mockReturnValue( false );
		} );

		test( 'should return false for non-ebanx country', () => {
			expect( isEbanxEnabledForCountry( 'AU' ) ).toEqual( false );
		} );
		test( 'should return true for ebanx country', () => {
			expect( isEbanxEnabledForCountry( 'BR' ) ).toEqual( true );
		} );
	} );

	describe( 'isValidCPF', () => {
		test( 'should return true for valid CPF (Brazilian tax identification number)', () => {
			expect( isValidCPF( '85384484632' ) ).toEqual( true );
			expect( isValidCPF( '853.513.468-93' ) ).toEqual( true );
		} );
		test( 'should return false for invalid CPF', () => {
			expect( isValidCPF( '85384484612' ) ).toEqual( false );
			expect( isValidCPF( '853.844.846.12' ) ).toEqual( false );
		} );
	} );
} );
