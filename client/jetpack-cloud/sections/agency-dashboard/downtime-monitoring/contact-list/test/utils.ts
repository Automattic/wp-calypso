import { getContactItemValue, getContactActionEventName } from '../utils';

describe( 'getContactItemValue', () => {
	it( 'gets the email value from an email contact item', () => {
		const emailContact = {
			name: 'Jane Smith',
			email: 'janesmith@example.com',
			verified: true,
		};
		const type = 'email';
		const value = getContactItemValue( type, emailContact );
		expect( value ).toBe( emailContact.email );
	} );

	it( 'gets the phone number value from an SMS contact item', () => {
		const smsContact = {
			name: 'Jane Smith',
			countryCode: 'US',
			countryNumericCode: '1',
			phoneNumber: '1234567890',
			phoneNumberFull: '+11234567890',
			verified: true,
		};
		const type = 'sms';
		const value = getContactItemValue( type, smsContact );
		expect( value ).toBe( smsContact.phoneNumberFull );
	} );

	it( 'returns null for an unknown contact type', () => {
		const unknownContact = {
			name: 'John Doe',
			id: 'johndoe@example.com',
		};
		const type = 'unknown';
		// We want to test the case where the contact type is not known
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-ignore
		const value = getContactItemValue( type, unknownContact );
		expect( value ).toBe( null );
	} );
} );

describe( 'getContactActionEventName', () => {
	it( 'gets the correct event name for adding an email contact', () => {
		const type = 'email';
		const action = 'add';
		const eventName = getContactActionEventName( type, action );
		expect( eventName ).toBe( 'downtime_monitoring_email_address_add_click' );
	} );

	it( 'gets the correct event name for editing an SMS contact', () => {
		const type = 'sms';
		const action = 'edit';
		const eventName = getContactActionEventName( type, action );
		expect( eventName ).toBe( 'downtime_monitoring_phone_number_edit_click' );
	} );

	it( 'gets the correct event name for removing a contact', () => {
		const type = 'email';
		const action = 'remove';
		const eventName = getContactActionEventName( type, action );
		expect( eventName ).toBe( 'downtime_monitoring_email_address_remove_click' );
	} );

	it( 'gets the correct event name for unknown action to email contact', () => {
		const type = 'email';
		const action = 'unknown	';
		// We want to test the case where the contact type is not known
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-ignore
		const eventName = getContactActionEventName( type, action );
		expect( eventName ).toBe( undefined );
	} );

	it( 'gets the correct event name for verifying an unknown contact type', () => {
		const type = 'unknown';
		const action = 'verify';
		// We want to test the case where the contact type is not known
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-ignore
		const eventName = getContactActionEventName( type, action );
		expect( eventName ).toBe( undefined );
	} );
} );
