import normalizePhoneNumber from '../normalize-phone-number';

test( 'normalizes national business phones and preserves international numbers and extensions', () => {
	expect( normalizePhoneNumber( '020 1234 5678 ext42', 'GB' ) ).toBe( '+442012345678 ext 42' );
	expect( normalizePhoneNumber( '06 1234 5678', 'IT' ) ).toBe( '+390612345678' );
	expect( normalizePhoneNumber( '+34 (91) 123-4567 ext 9', 'US' ) ).toBe( '+34911234567 ext 9' );
	expect( normalizePhoneNumber( '+1234' ) ).toBe( '+1234' );
	expect( normalizePhoneNumber( '' ) ).toBe( '' );
	expect( normalizePhoneNumber( '+44abc1234', 'GB' ) ).toBeNull();
	expect( normalizePhoneNumber( '+1234 ext x', 'US' ) ).toBeNull();
	expect( normalizePhoneNumber( '+0123' ) ).toBeNull();
} );
