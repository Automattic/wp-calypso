import { getSecurityLevel } from '../get-security-level';

describe( 'getSecurityLevel', () => {
	test.each( [
		[ 'none when nothing is set up', false, false, false, 'none' ],
		[ 'partial with a recovery email but no 2FA', true, false, false, 'partial' ],
		[ 'partial with a recovery phone but no 2FA', false, true, false, 'partial' ],
		[ 'partial with 2FA but no recovery method', false, false, true, 'partial' ],
		[ 'strong with a recovery email and 2FA', true, false, true, 'strong' ],
		[ 'strong with a recovery phone and 2FA', false, true, true, 'strong' ],
	] )( 'is %s', ( _label, email, phone, twoFactor, expected ) => {
		expect( getSecurityLevel( email as boolean, phone as boolean, twoFactor as boolean ) ).toBe(
			expected
		);
	} );
} );
