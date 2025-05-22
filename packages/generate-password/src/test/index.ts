/**
 * @jest-environment jsdom
 */
import { webcrypto } from 'node:crypto';
import { generatePassword, DIGITS, SPECIAL_CHARS, EXTRA_SPECIAL_CHARS } from '../';

describe( 'generatePassword', () => {
	const mockRandomValues = jest.fn( ( array ) => webcrypto.getRandomValues( array ) );

	Object.defineProperty( window, 'crypto', {
		value: {
			getRandomValues: mockRandomValues,
		},
	} );

	describe( '.length', () => {
		test( 'should use default length of 24', () => {
			expect( generatePassword() ).toHaveLength( 24 );
		} );

		test( 'should respect `length` param', () => {
			expect( generatePassword( { length: 12 } ) ).toHaveLength( 12 );
			expect( generatePassword( { length: 1337 } ) ).toHaveLength( 1337 );
			expect( generatePassword( { length: 99 } ) ).toHaveLength( 99 );
		} );

		test( 'should not contain digits', () => {
			const pw = generatePassword( { length: 1000, useNumbers: false } );
			expect( pw ).not.toMatch( new RegExp( `[${ DIGITS }]`, 'g' ) );
		} );

		test( 'should not contain special characters', () => {
			const pw = generatePassword( { length: 1000, useSpecialChars: false } );
			expect( pw ).not.toMatch( new RegExp( `[${ SPECIAL_CHARS }]`, 'g' ) );
		} );

		test( 'should not contain extra special characters', () => {
			const pw = generatePassword( { length: 1000, useExtraSpecialChars: false } );
			expect( pw ).not.toMatch( new RegExp( `[${ EXTRA_SPECIAL_CHARS }]`, 'g' ) );
		} );
	} );
} );
