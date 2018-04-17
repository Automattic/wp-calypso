/**
 * @format
 * @jest-environment jsdom
 */

/**
 * Internal dependencies
 */
import { formatCreditCard } from '../masking';

jest.mock( 'lib/abtest', () => ( {
	abtest: () => '',
} ) );

describe( 'index', () => {
	describe( 'Masking', () => {
		describe( 'American Express Card', () => {
			test( 'formats a number as 4-6-5', () => {
				expect( formatCreditCard( '378282246310005' ) ).toEqual( '3782 822463 10005' );
			} );
			test( 'formats a number as 4-6-5 with any sort of whitespace', () => {
				expect( formatCreditCard( ' 3782 8224 6310 005 ' ) ).toEqual( '3782 822463 10005' );
			} );
			test( 'formats a number as 4-6-5 and trims to 15 digits', () => {
				expect( formatCreditCard( '37828224631000512345' ) ).toEqual( '3782 822463 10005' );
			} );
		} );
		describe( 'Diner Credit Cards', () => {
			test( 'formats a number as 4-4-4-2', () => {
				expect( formatCreditCard( '30569309025904' ) ).toEqual( '3056 9309 0259 04' );
			} );
			test( 'formats a number as 4-4-4-2 with any sort of whitespace', () => {
				expect( formatCreditCard( '3056 9309 025   904' ) ).toEqual( '3056 9309 0259 04' );
			} );
		} );
		describe( 'All Other Credit Cards', () => {
			test( 'formats a number as 4-4-4-4', () => {
				expect( formatCreditCard( '2223003122003222' ) ).toEqual( '2223 0031 2200 3222' );
			} );
			test( 'formats a number as 4-4-4-4 with any sort of whitespace', () => {
				expect( formatCreditCard( '2223 0031220     03222' ) ).toEqual( '2223 0031 2200 3222' );
			} );
			test( '19 digit cards format as 4-4-4-7', () => {
				expect( formatCreditCard( '6011496233608973938' ) ).toEqual( '6011 4962 3360 8973938' );
			} );
			test( 'has a maximum length of 19', () => {
				expect( formatCreditCard( '6011496233608973938123456789' ) ).toEqual(
					'6011 4962 3360 8973938'
				);
			} );
		} );
	} );
} );
