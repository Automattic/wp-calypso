import { getEmailAddressError, isValidEmailAddress } from '../email-validation';

describe( 'getEmailAddressError', () => {
	test( 'returns null for a well-formed address on a known TLD', () => {
		expect( getEmailAddressError( 'user@example.com' ) ).toBeNull();
	} );

	test( 'returns invalid_format when the address is not structurally an email', () => {
		expect( getEmailAddressError( 'not-an-email' ) ).toBe( 'invalid_format' );
	} );

	test( 'returns invalid_format for an empty string', () => {
		expect( getEmailAddressError( '' ) ).toBe( 'invalid_format' );
	} );

	test( 'returns invalid_format when the domain has no dot', () => {
		expect( getEmailAddressError( 'user@localhost' ) ).toBe( 'invalid_format' );
	} );

	test( 'returns unknown_tld when the last label is not a registered TLD', () => {
		expect( getEmailAddressError( 'user@gmail.commmm' ) ).toBe( 'unknown_tld' );
	} );

	test( 'returns unknown_tld when text is appended after a real TLD', () => {
		expect( getEmailAddressError( 'user@gmail.comOh' ) ).toBe( 'unknown_tld' );
	} );

	test( 'matches TLDs case-insensitively', () => {
		expect( getEmailAddressError( 'user@example.COM' ) ).toBeNull();
	} );

	test( 'accepts a newer generic TLD', () => {
		expect( getEmailAddressError( 'user@example.zip' ) ).toBeNull();
	} );

	test( 'accepts a multi-label domain on a country-code TLD', () => {
		expect( getEmailAddressError( 'user@mail.example.co.uk' ) ).toBeNull();
	} );
} );

describe( 'isValidEmailAddress', () => {
	test( 'returns true when there is no error', () => {
		expect( isValidEmailAddress( 'user@example.com' ) ).toBe( true );
	} );

	test( 'returns false for an unknown TLD', () => {
		expect( isValidEmailAddress( 'user@gmail.commmm' ) ).toBe( false );
	} );

	test( 'returns false for a malformed address', () => {
		expect( isValidEmailAddress( 'user@' ) ).toBe( false );
	} );
} );
