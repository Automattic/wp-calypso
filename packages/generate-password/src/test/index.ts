/**
 * @jest-environment jsdom
 */
// eslint-disable-next-line import/no-nodejs-modules
import { webcrypto } from 'node:crypto';
import { generatePassword } from '../';

describe( 'generatePassword', () => {
	const mockRandomValues = jest.fn( ( array ) => webcrypto.getRandomValues( array ) );

	Object.defineProperty( window, 'crypto', {
		value: {
			getRandomValues: mockRandomValues,
		},
	} );

	describe( `.length`, () => {
		test( 'should use default length of 24', () => {
			expect( generatePassword() ).toHaveLength( 24 );
		} );

		test( 'should respect `length` param', () => {
			expect( generatePassword( { length: 12 } ) ).toHaveLength( 12 );
			expect( generatePassword( { length: 1337 } ) ).toHaveLength( 1337 );
			expect( generatePassword( { length: 99 } ) ).toHaveLength( 99 );
		} );
	} );
} );
