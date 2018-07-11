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
import {
	isEbanxCreditCardProcessingEnabledForCountry,
	isValidCPF,
	shouldRenderAdditionalEbanxFields,
} from '../ebanx';
import { isPaymentMethodEnabled } from 'lib/cart-values';

jest.mock( 'lib/cart-values', () => {
	const cartValues = {};

	cartValues.isPaymentMethodEnabled = jest.fn( false, false );

	return cartValues;
} );

describe( 'Ebanx payment processing methods', () => {
	describe( 'isEbanxCreditCardProcessingEnabledForCountry', () => {
		beforeAll( () => {
			isPaymentMethodEnabled.mockReturnValue( true );
		} );
		afterAll( () => {
			isPaymentMethodEnabled.mockReturnValue( false );
		} );

		test( 'should return false for non-ebanx country', () => {
			expect( isEbanxCreditCardProcessingEnabledForCountry( 'AU' ) ).toEqual( false );
		} );
		test( 'should return true for ebanx country', () => {
			expect( isEbanxCreditCardProcessingEnabledForCountry( 'BR' ) ).toEqual( true );
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

	describe( 'shouldRenderAdditionalEbanxFields', () => {
		beforeAll( () => {
			isPaymentMethodEnabled.mockReturnValue( true );
		} );
		afterAll( () => {
			isPaymentMethodEnabled.mockReturnValue( false );
		} );

		test( 'should return false for non-ebanx country', () => {
			expect( shouldRenderAdditionalEbanxFields( 'AU' ) ).toEqual( false );
		} );
		test( 'should return true for ebanx country that requires additional fields', () => {
			expect( shouldRenderAdditionalEbanxFields( 'BR' ) ).toEqual( true );
			expect( shouldRenderAdditionalEbanxFields( 'MX' ) ).toEqual( true );
		} );
	} );
} );
