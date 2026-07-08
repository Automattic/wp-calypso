import { mapValidationMessagesToFieldErrors, resolveSmsCountry } from '../contact-validation-utils';
import type { ContactValidationResponseMessages, SMSCountryCode } from '@automattic/api-core';

describe( 'mapValidationMessagesToFieldErrors', () => {
	it( 'returns an empty map when there are no messages', () => {
		expect( mapValidationMessagesToFieldErrors( undefined ) ).toEqual( {} );
		expect( mapValidationMessagesToFieldErrors( {} ) ).toEqual( {} );
	} );

	it( 'maps API (snake_case) message keys to field IDs and keeps the first message', () => {
		const messages: ContactValidationResponseMessages = {
			postal_code: [ 'Please use the A1B 2C3 format.', 'Second message' ],
			country_code: [ 'Invalid country.' ],
		};

		expect( mapValidationMessagesToFieldErrors( messages ) ).toEqual( {
			postalCode: 'Please use the A1B 2C3 format.',
			countryCode: 'Invalid country.',
		} );
	} );

	it( 'ignores fields with empty message arrays and non-field keys', () => {
		const messages = {
			state: [],
			extra: { ca: { cira_agreement_accepted: [ 'nope' ] } },
		} as unknown as ContactValidationResponseMessages;

		expect( mapValidationMessagesToFieldErrors( messages ) ).toEqual( {} );
	} );
} );

const SMS_COUNTRY_CODES: SMSCountryCode[] = [
	{ code: 'BS', country_name: 'Bahamas', name: 'Bahamas (+1)', numeric_code: '+1' },
	{ code: 'CA', country_name: 'Canada', name: 'Canada (+1)', numeric_code: '+1' },
	{ code: 'US', country_name: 'United States', name: 'United States (+1)', numeric_code: '+1' },
	{ code: 'DE', country_name: 'Germany', name: 'Germany (+49)', numeric_code: '+49' },
];

describe( 'resolveSmsCountry', () => {
	test( 'prefers the contact country when several countries share a dialing code', () => {
		// Regression test for DOMENG-635: a +1 US number used to resolve to the
		// first +1 entry (the Bahamas) instead of the contact's own country.
		expect( resolveSmsCountry( SMS_COUNTRY_CODES, '+1', 'US' )?.code ).toBe( 'US' );
		expect( resolveSmsCountry( SMS_COUNTRY_CODES, '+1', 'CA' )?.code ).toBe( 'CA' );
	} );

	test( 'falls back to the first match when the contact country does not share the code', () => {
		expect( resolveSmsCountry( SMS_COUNTRY_CODES, '+1', 'GB' )?.code ).toBe( 'BS' );
	} );

	test( 'falls back to the first match when no contact country is set', () => {
		// The call site defaults the contact country to '' when none is selected,
		// so this is the real-world input before an address country is chosen.
		expect( resolveSmsCountry( SMS_COUNTRY_CODES, '+1', '' )?.code ).toBe( 'BS' );
	} );

	test( 'resolves an unambiguous dialing code regardless of the contact country', () => {
		expect( resolveSmsCountry( SMS_COUNTRY_CODES, '+49', 'US' )?.code ).toBe( 'DE' );
	} );

	test( 'returns undefined when no country matches the dialing code', () => {
		expect( resolveSmsCountry( SMS_COUNTRY_CODES, '+99', 'US' ) ).toBeUndefined();
	} );

	test( 'returns undefined when the country list is unavailable', () => {
		expect( resolveSmsCountry( undefined, '+1', 'US' ) ).toBeUndefined();
	} );
} );
