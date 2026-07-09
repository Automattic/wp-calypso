import { recoveryEmailMatchesAccountEmail } from '../utils';

describe( 'recoveryEmailMatchesAccountEmail', () => {
	test( 'returns true when the addresses are identical', () => {
		expect( recoveryEmailMatchesAccountEmail( 'user@example.com', 'user@example.com' ) ).toBe(
			true
		);
	} );

	test( 'returns false when the addresses differ', () => {
		expect( recoveryEmailMatchesAccountEmail( 'recovery@example.com', 'user@example.com' ) ).toBe(
			false
		);
	} );

	test( 'matches case-insensitively (same mailbox)', () => {
		expect( recoveryEmailMatchesAccountEmail( 'User@Example.com', 'user@example.com' ) ).toBe(
			true
		);
	} );

	test( 'ignores surrounding whitespace', () => {
		expect( recoveryEmailMatchesAccountEmail( '  user@example.com  ', 'user@example.com' ) ).toBe(
			true
		);
	} );

	test( 'returns false when either address is empty or undefined', () => {
		expect( recoveryEmailMatchesAccountEmail( '', 'user@example.com' ) ).toBe( false );
		expect( recoveryEmailMatchesAccountEmail( 'user@example.com', '' ) ).toBe( false );
		expect( recoveryEmailMatchesAccountEmail( undefined, 'user@example.com' ) ).toBe( false );
		expect( recoveryEmailMatchesAccountEmail( 'user@example.com', undefined ) ).toBe( false );
	} );
} );
