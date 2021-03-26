/**
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
	isValidCNPJ,
} from '../processor-specific';

describe( 'Ebanx payment processing methods', () => {
	const cart = { allowed_payment_methods: [ 'WPCOM_Billing_Ebanx' ] };

	describe( 'isEbanxCreditCardProcessingEnabledForCountry', () => {
		test( 'should return false for non-ebanx country', () => {
			expect( isEbanxCreditCardProcessingEnabledForCountry( 'AU', cart ) ).toEqual( false );
		} );
		test( 'should return true for ebanx country', () => {
			expect( isEbanxCreditCardProcessingEnabledForCountry( 'BR', cart ) ).toEqual( true );
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

	describe( 'isValidCNPJ', () => {
		test( 'should return true for valid CNPJ (Brazilian company tax identification number)', () => {
			expect( isValidCNPJ( '94065313000171' ) ).toEqual( true );
			expect( isValidCNPJ( '94.065.313/0001-71' ) ).toEqual( true );
		} );
		test( 'should return false for invalid CPF', () => {
			expect( isValidCNPJ( '94065313000170' ) ).toEqual( false );
			expect( isValidCNPJ( '94.065.313/0001-70' ) ).toEqual( false );
		} );
	} );
} );
