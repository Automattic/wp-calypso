import { validatePhone } from '../phone-number';

describe( 'validatePhone', () => {
	describe( 'basic validation errors', () => {
		it( 'should return error for empty phone number', () => {
			const result = validatePhone( '' );
			expect( result ).toEqual( {
				error: 'phone_number_empty',
				message: 'Please enter a phone number',
			} );
		} );

		it( 'should return error for phone number containing letters', () => {
			const result = validatePhone( '123abc456' );
			expect( result ).toEqual( {
				error: 'phone_number_contains_letters',
				message: 'Phone numbers cannot contain letters',
			} );
		} );

		it( 'should return error for phone number that is too short', () => {
			const result = validatePhone( '1234567' );
			expect( result ).toEqual( {
				error: 'phone_number_too_short',
				message: 'This number is too short',
			} );
		} );

		it( 'should return error for phone number with special characters', () => {
			const result = validatePhone( '123-456-7890' );
			expect( result ).toEqual( {
				error: 'phone_number_contains_special_characters',
				message: 'Phone numbers cannot contain special characters',
			} );
		} );
	} );

	describe( 'valid phone numbers', () => {
		it( 'should return success for valid US phone number', () => {
			const result = validatePhone( '2025551234' );
			expect( result ).toEqual( {
				info: 'phone_number_valid',
				message: 'Valid phone number',
			} );
		} );

		it( 'should return success for valid US phone number with plus sign', () => {
			const result = validatePhone( '+12025551234' );
			expect( result ).toEqual( {
				info: 'phone_number_valid',
				message: 'Valid phone number',
			} );
		} );

		it( 'should return success for valid phone number without country code', () => {
			const result = validatePhone( '2025551234' );
			expect( result ).toEqual( {
				info: 'phone_number_valid',
				message: 'Valid phone number',
			} );
		} );

		it( 'should return success for valid international phone number', () => {
			const result = validatePhone( '+447911123456' );
			expect( result ).toEqual( {
				info: 'phone_number_valid',
				message: 'Valid phone number',
			} );
		} );
	} );

	describe( 'invalid phone numbers', () => {
		it( 'should return error for invalid phone number that passes basic validation', () => {
			const result = validatePhone( '1234567890' );
			expect( result ).toEqual( {
				error: 'phone_number_invalid',
				message: 'That phone number does not appear to be valid',
			} );
		} );

		it( 'should return error for invalid area code', () => {
			const result = validatePhone( '9995551234' );
			expect( result ).toEqual( {
				error: 'phone_number_invalid',
				message: 'That phone number does not appear to be valid',
			} );
		} );

		it( 'should return error for phone number too long', () => {
			const result = validatePhone( '12345678901234567890' );
			expect( result ).toEqual( {
				error: 'phone_number_invalid',
				message: 'That phone number does not appear to be valid',
			} );
		} );
	} );

	describe( 'edge cases', () => {
		it( 'should handle phone number with multiple plus signs', () => {
			const result = validatePhone( '++1234567890' );
			expect( result ).toEqual( {
				error: 'phone_number_invalid',
				message: 'That phone number does not appear to be valid',
			} );
		} );

		it( 'should handle phone number with plus sign in the middle', () => {
			const result = validatePhone( '123+4567890' );
			expect( result ).toEqual( {
				error: 'phone_number_invalid',
				message: 'That phone number does not appear to be valid',
			} );
		} );

		it( 'should handle phone number with commas (bug in regex)', () => {
			const result = validatePhone( '123,456,7890' );
			expect( result ).toEqual( {
				error: 'phone_number_contains_letters',
				message: 'Phone numbers cannot contain letters',
			} );
		} );
	} );

	describe( 'validation order', () => {
		it( 'should check validations in correct order', () => {
			expect( validatePhone( '' ).error ).toBe( 'phone_number_empty' );
			expect( validatePhone( 'abc' ).error ).toBe( 'phone_number_contains_letters' );
			expect( validatePhone( '123' ).error ).toBe( 'phone_number_too_short' );
			expect( validatePhone( '1234567890-' ).error ).toBe(
				'phone_number_contains_special_characters'
			);
			expect( validatePhone( '1234567890' ).error ).toBe( 'phone_number_invalid' );
		} );
	} );
} );
