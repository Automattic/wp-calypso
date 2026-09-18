import { isValidPhoneNumberFormat } from '../use-contact-form-validation';

describe( 'isValidPhoneNumberFormat', () => {
	it( 'accepts an empty phone number since the field is optional', () => {
		expect( isValidPhoneNumberFormat( undefined ) ).toBe( true );
		expect( isValidPhoneNumberFormat( { phoneNumber: '', phoneNumberFull: '+1' } ) ).toBe( true );
	} );

	it( 'rejects non-numeric input', () => {
		expect(
			isValidPhoneNumberFormat( { phoneNumber: 'abc123', phoneNumberFull: '+1abc123' } )
		).toBe( false );
		expect(
			isValidPhoneNumberFormat( { phoneNumber: '4155550123x', phoneNumberFull: '+14155550123x' } )
		).toBe( false );
	} );

	it( 'rejects numbers that are too short or too long', () => {
		expect( isValidPhoneNumberFormat( { phoneNumber: '12345', phoneNumberFull: '+112345' } ) ).toBe(
			false
		);
		expect(
			isValidPhoneNumberFormat( {
				phoneNumber: '4155550123456789',
				phoneNumberFull: '+14155550123456789',
			} )
		).toBe( false );
	} );

	it( 'accepts mobile and landline numbers', () => {
		expect(
			isValidPhoneNumberFormat( { phoneNumber: '4155550123', phoneNumberFull: '+14155550123' } )
		).toBe( true );
		expect(
			isValidPhoneNumberFormat( { phoneNumber: '2079460958', phoneNumberFull: '+442079460958' } )
		).toBe( true );
		expect(
			isValidPhoneNumberFormat( { phoneNumber: '28123456', phoneNumberFull: '+6328123456' } )
		).toBe( true );
	} );

	it( 'accepts a prefilled number that still contains separators', () => {
		expect(
			isValidPhoneNumberFormat( {
				phoneNumber: '+1 (415) 555-0123',
				phoneNumberFull: '+1 (415) 555-0123',
			} )
		).toBe( true );
	} );
} );
