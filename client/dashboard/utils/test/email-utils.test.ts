import { maskEmail } from '../email-utils';

describe( 'maskEmail', () => {
	describe( 'standard email addresses', () => {
		it( 'should mask a typical email address', () => {
			expect( maskEmail( 'johndoe@example.com' ) ).toBe( 'jo***oe@example.com' );
		} );

		it( 'should mask another typical email address', () => {
			expect( maskEmail( 'jane.smith@company.org' ) ).toBe( 'ja***th@company.org' );
		} );
	} );

	describe( 'short local parts', () => {
		it( 'should handle single character local part', () => {
			expect( maskEmail( 'a@example.com' ) ).toBe( 'a***@example.com' );
		} );

		it( 'should handle two character local part', () => {
			expect( maskEmail( 'ab@example.com' ) ).toBe( 'a***@example.com' );
		} );

		it( 'should handle three character local part', () => {
			expect( maskEmail( 'abc@example.com' ) ).toBe( 'a***c@example.com' );
		} );

		it( 'should handle four character local part', () => {
			expect( maskEmail( 'abcd@example.com' ) ).toBe( 'a***d@example.com' );
		} );
	} );

	describe( 'longer local parts', () => {
		it( 'should show first 2 and last 2 chars for 5+ character local part', () => {
			expect( maskEmail( 'abcde@example.com' ) ).toBe( 'ab***de@example.com' );
		} );

		it( 'should handle very long local parts', () => {
			expect( maskEmail( 'verylongemail@example.com' ) ).toBe( 've***il@example.com' );
		} );
	} );

	describe( 'domain handling', () => {
		it( 'should preserve the full domain', () => {
			expect( maskEmail( 'username@subdomain.example.co.uk' ) ).toBe(
				'us***me@subdomain.example.co.uk'
			);
		} );

		it( 'should handle domains with numbers', () => {
			expect( maskEmail( 'contact@123mail.com' ) ).toBe( 'co***ct@123mail.com' );
		} );
	} );

	describe( 'edge cases', () => {
		it( 'should return the original string if no @ symbol is present', () => {
			expect( maskEmail( 'notanemail' ) ).toBe( 'notanemail' );
		} );

		it( 'should handle email with special characters in local part', () => {
			expect( maskEmail( 'user.name+tag@example.com' ) ).toBe( 'us***ag@example.com' );
		} );

		it( 'should handle email with numbers in local part', () => {
			expect( maskEmail( 'user123@example.com' ) ).toBe( 'us***23@example.com' );
		} );
	} );
} );
