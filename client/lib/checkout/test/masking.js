/**
 * @jest-environment jsdom
 */

/**
 * Internal dependencies
 */
import { formatCreditCard, maskField, unmaskField } from '../masking';

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

	describe( 'CVV', () => {
		test( 'should return correct value', () => {
			expect( maskField( 'cvv', null, '666' ) ).toEqual( '666' );
			expect( unmaskField( 'cvv', null, '666' ) ).toEqual( '666' );
		} );

		test( 'should replace non-numeric values', () => {
			expect( maskField( 'cvv', null, '5$5.5w6 6_666' ) ).toEqual( '5556' );
			expect( unmaskField( 'cvv', null, '5$5.5w6 6_666' ) ).toEqual( '5556' );
		} );

		test( 'should format the next value as max 4 digits', () => {
			expect( maskField( 'cvv', null, '333111222000' ) ).toEqual( '3331' );
			expect( unmaskField( 'cvv', null, '333111222000' ) ).toEqual( '3331' );
		} );

		test( 'should deformat the next value as max 4 digits', () => {
			expect( maskField( 'cvv', '333111222000', '55566666' ) ).toEqual( '5556' );
			expect( unmaskField( 'cvv', '333111222000', '55566666' ) ).toEqual( '5556' );
		} );
	} );

	describe( 'expiration-date', () => {
		test( 'should replace non-numeric values on unmasking and masking', () => {
			expect( maskField( 'expiration-date', null, 'w$%&' ) ).toEqual( '' );
			expect( maskField( 'expiration-date', null, '10/ee' ) ).toEqual( '10' );
			expect( maskField( 'expiration-date', null, '10/2#' ) ).toEqual( '10/2' );
			expect( unmaskField( 'expiration-date', null, 'w$%&' ) ).toEqual( '' );
			expect( unmaskField( 'expiration-date', null, '10/ee' ) ).toEqual( '10' );
			expect( unmaskField( 'expiration-date', null, '10/2#' ) ).toEqual( '10/2' );
		} );

		test( 'should return correct value', () => {
			expect( maskField( 'expiration-date', null, '2222' ) ).toEqual( '22/22' );
			expect( unmaskField( 'expiration-date', null, '2222' ) ).toEqual( '22/22' );
		} );

		test( 'should return raw input if input length less that 3', () => {
			expect( maskField( 'expiration-date', '02/33', '12' ) ).toEqual( '12' );
			expect( unmaskField( 'expiration-date', '02/33', '12' ) ).toEqual( '12' );
		} );

		test( 'should return raw input if input length less that previous entry', () => {
			expect( maskField( 'expiration-date', '02/33', '1233' ) ).toEqual( '1233' );
			expect( unmaskField( 'expiration-date', '02/33', '1233' ) ).toEqual( '1233' );
		} );

		test( 'should format if new value length is greater than previous entry', () => {
			expect( maskField( 'expiration-date', '023', '0233' ) ).toEqual( '02/33' );
			expect( unmaskField( 'expiration-date', '023', '0233' ) ).toEqual( '02/33' );
		} );
	} );
} );
