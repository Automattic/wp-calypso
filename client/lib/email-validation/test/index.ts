import { isValidEmail, validateEmail } from '../index';

describe( 'Email Validation', () => {
	describe( 'isValidEmail', () => {
		test.each( [
			[ 'user@gmail.com', 'standard email' ],
			[ 'test@example.org', 'standard email with .org' ],
			[ 'admin@domain.net', 'standard email with .net' ],
			[ 'user@mail.example.com', 'email with subdomain' ],
			[ 'test@subdomain.domain.org', 'email with multi-level subdomain' ],
			[ 'user@example.co.uk', 'email with multi-level TLD' ],
			[ 'test@domain.com.au', 'email with .com.au TLD' ],
			[ 'first.last@example.com', 'email with dots in local part' ],
			[ 'user+tag@gmail.com', 'email with plus sign' ],
			[ 'user_name@example.org', 'email with underscore' ],
			[ 'user123@example.com', 'email with numbers in local part' ],
			[ 'test1@domain.org', 'email with numbers' ],
			[ 'user@example.io', 'email with .io TLD' ],
			[ 'test@site.dev', 'email with .dev TLD' ],
			[ 'admin@company.tech', 'email with .tech TLD' ],
		] )( 'should accept %s (%s)', ( email ) => {
			expect( isValidEmail( email ) ).toBe( true );
		} );

		describe( 'Invalid emails - TLD issues (Issue #106738)', () => {
			test.each( [
				[ 'user@gmail.comExtraText', 'extra text after .com' ],
				[ 'test@example.comOh', 'extra characters after TLD' ],
				[ 'admin@domain.orgIcanEnterWhateverTextIwant', 'arbitrary text after .org' ],
				[ 'mahangu+wpcom20251027@gmail.comIcan', 'reported case from issue #106738' ],
				[ 'user@example.commmm', 'repeated TLD characters' ],
				[ 'test@domain.commm', 'extended TLD' ],
				[ 'user@domain.co.uk.fake', 'fake multi-level TLD' ],
				[ 'test@example.com.invalid', 'invalid multi-level TLD' ],
			] )( 'should reject %s (%s)', ( email ) => {
				expect( isValidEmail( email ) ).toBe( false );
			} );
		} );

		describe( 'Invalid emails - format issues', () => {
			test.each( [
				[ '', 'empty string' ],
				[ '   ', 'whitespace only' ],
				[ 'usergmail.com', 'missing @ symbol' ],
				[ 'test.example.org', 'missing @ symbol' ],
				[ 'user@', 'missing domain' ],
				[ '@example.com', 'missing local part' ],
				[ 'user@@example.com', 'double @ symbol' ],
				[ 'test@user@example.com', 'multiple @ symbols' ],
				[ 'user@domain', 'missing TLD' ],
				[ 'test@localhost', 'localhost without TLD' ],
				[ 'user@exam ple.com', 'space in domain' ],
				[ 'test@domain!.org', 'invalid character in domain' ],
			] )( 'should reject %s (%s)', ( email ) => {
				expect( isValidEmail( email ) ).toBe( false );
			} );
		} );
	} );

	describe( 'validateEmail', () => {
		test( 'should return detailed validation results for valid emails', () => {
			expect( validateEmail( 'user@gmail.com' ) ).toEqual( {
				isValid: true,
			} );
		} );

		test( 'should return error type for empty emails', () => {
			expect( validateEmail( '' ) ).toEqual( {
				isValid: false,
				error: 'empty',
			} );
		} );

		test( 'should return error type for invalid format', () => {
			expect( validateEmail( 'notanemail' ) ).toEqual( {
				isValid: false,
				error: 'invalid_format',
			} );
		} );

		test( 'should return error for invalid TLD', () => {
			const result = validateEmail( 'user@gmail.comExtraText' );
			expect( result.isValid ).toBe( false );
			expect( result.error ).toBeDefined();
		} );
	} );
} );
