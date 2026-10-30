import normalizePhoneNumber, { getNationalPhoneNumber } from '../normalize-phone-number';

test( 'normalizes national business phones and preserves international numbers and extensions', () => {
	expect( normalizePhoneNumber( '020 1234 5678 ext42', 'GB' ) ).toBe( '+442012345678 ext 42' );
	expect( normalizePhoneNumber( '06 1234 5678', 'IT' ) ).toBe( '+390612345678' );
	expect( normalizePhoneNumber( '+34 (91) 123-4567 ext 9', 'US' ) ).toBe( '+34911234567 ext 9' );
	expect( normalizePhoneNumber( '+1234' ) ).toBe( '+1234' );
	expect( normalizePhoneNumber( '' ) ).toBe( '' );
	expect( normalizePhoneNumber( '+44abc1234', 'GB' ) ).toBeNull();
	expect( normalizePhoneNumber( '+1234 ext x', 'US' ) ).toBeNull();
	expect( normalizePhoneNumber( '+0123' ) ).toBeNull();

	const britishPhone = getNationalPhoneNumber( '+442012345678 ext 42', 'US' );
	expect( britishPhone ).toEqual( { countryCode: 'GB', phoneNumber: '02012345678 ext 42' } );
	expect( normalizePhoneNumber( britishPhone.phoneNumber, britishPhone.countryCode ) ).toBe(
		'+442012345678 ext 42'
	);
	expect( getNationalPhoneNumber( '+390612345678', 'GB' ) ).toEqual( {
		countryCode: 'IT',
		phoneNumber: '0612345678',
	} );
	expect( getNationalPhoneNumber( '+14165551234', 'CA' ) ).toEqual( {
		countryCode: 'CA',
		phoneNumber: '4165551234',
	} );
	expect( getNationalPhoneNumber( '+44abc1234', 'GB' ) ).toEqual( {
		countryCode: 'GB',
		phoneNumber: '+44abc1234',
	} );
} );
