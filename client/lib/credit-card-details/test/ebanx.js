/**
 * @format
 */

/**
 * External dependencies
 */

/**
 * Internal dependencies
 */
import { isEbanx, isValidCPF } from '../ebanx';
import { isEnabled } from 'config';

jest.mock( 'config', () => {
	const config = () => 'development';

	config.isEnabled = jest.fn( false );

	return config;
} );

describe( 'Ebanx payment processing methods', () => {
	describe( 'isEbanx', () => {
		beforeAll( () => {
			isEnabled.mockReturnValue( true );
		} );
		afterAll( () => {
			isEnabled.mockReturnValue( false );
		} );

		test( 'should return false for non-ebanx country', () => {
			expect( isEbanx( 'AU' ) ).toEqual( false );
		} );
		test( 'should return true for ebanx country', () => {
			expect( isEbanx( 'BR' ) ).toEqual( true );
		} );
	} );

	describe( 'isValidCPF', () => {
		test( 'should return true for valid CPF (Brazilian tax identification number)', () => {
			expect( isValidCPF( '853.513.468-93' ) ).toEqual( true );
		} );
		test( 'should return false for invalid CPF', () => {
			expect( isValidCPF( '85384484632' ) ).toEqual( false );
			expect( isValidCPF( '853.844.846.32' ) ).toEqual( false );
		} );
	} );
} );
