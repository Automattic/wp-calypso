import { mapValidationMessagesToFieldErrors } from '../contact-validation-utils';
import type { ContactValidationResponseMessages } from '@automattic/api-core';

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
