// @ts-nocheck - TODO: Fix TypeScript issues
import {
	isCompleteContactInfo,
	getDefaultContactInfo,
	getContactInfoValue,
	getContactInfoPayload,
	isMatchingContactInfo,
	isContactAlreadyExists,
	removeFromContactList,
	addToContactList,
	isValidContactInfo,
} from '../utils';

const emailContact = {
	name: 'John Doe',
	email: 'johndoe@example.com',
};

const emailContactWithVerifiedKey = {
	...emailContact,
	verified: false,
};

const smsContact = {
	name: 'Jane Smith',
	countryCode: 'US',
	countryNumericCode: '+1',
	phoneNumber: '1234567890',
	phoneNumberFull: '+11234567890',
};

const smsContactWithVerifiedKey = {
	...smsContact,
	verified: true,
};

const nonExistingEmailContact = {
	name: 'Jane Smith',
	email: 'janesmith@example.com',
	verified: true,
};

describe( 'isCompleteContactInfo', () => {
	it( 'returns true for complete email contact with verification code', () => {
		const contact = {
			...emailContact,
			verificationCode: '123456',
		};
		expect( isCompleteContactInfo( 'email', contact, true ) ).toBe( true );
	} );

	it( 'returns false for incomplete email contact without verification code', () => {
		expect( isCompleteContactInfo( 'email', emailContact, true ) ).toBe( false );
	} );

	it( 'returns true for complete SMS contact with verification code', () => {
		const contact = {
			...smsContact,
			verificationCode: '123456',
		};
		expect( isCompleteContactInfo( 'sms', contact, true ) ).toBe( true );
	} );

	it( 'returns false for incomplete SMS contact without verification code', () => {
		expect( isCompleteContactInfo( 'sms', smsContact, true ) ).toBe( false );
	} );

	it( 'returns false for unknown contact type', () => {
		const unknownContact = {
			name: 'John Doe',
		};
		// We want to test the case where the contact type is not known
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-ignore
		expect( isCompleteContactInfo( 'unknownType', unknownContact, true ) ).toBe( false );
	} );
} );

describe( 'getDefaultContactInfo', () => {
	it( 'returns default email contact when type is email', () => {
		const contact = {
			...emailContact,
			verified: true,
		};
		const result = getDefaultContactInfo( 'email', contact );
		expect( result ).toEqual( {
			name: 'John Doe',
			email: 'johndoe@example.com',
			id: 'johndoe@example.com',
		} );
	} );

	it( 'returns default SMS contact when type is sms', () => {
		const result = getDefaultContactInfo( 'sms', smsContactWithVerifiedKey );
		expect( result ).toEqual( {
			name: 'Jane Smith',
			countryCode: 'US',
			countryNumericCode: '+1',
			phoneNumber: '1234567890',
			phoneNumberFull: '+11234567890',
			id: '+11234567890',
		} );
	} );

	it( 'returns default contact with empty values for unknown type', () => {
		// We want to test the case where the contact type is not known
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-ignore
		const result = getDefaultContactInfo( 'unknownType' );
		expect( result ).toEqual( {
			name: '',
		} );
	} );

	it( 'returns default contact with empty values when no contact provided', () => {
		const result = getDefaultContactInfo( 'email' );
		expect( result ).toEqual( {
			name: '',
		} );
	} );
} );

describe( 'getContactInfoValue', () => {
	it( 'returns email address from contact info when type is email', () => {
		const result = getContactInfoValue( 'email', emailContact );
		expect( result ).toBe( 'johndoe@example.com' );
	} );

	it( 'returns phone number from contact info when type is sms', () => {
		const result = getContactInfoValue( 'sms', smsContact );
		expect( result ).toBe( '+11234567890' );
	} );

	it( 'returns name from contact info for unknown type', () => {
		const contactInfo = {
			name: 'John Doe',
		};
		// We want to test the case where the contact type is not known
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-ignore
		const result = getContactInfoValue( 'unknownType', contactInfo );
		expect( result ).toBe( 'John Doe' );
	} );

	it( 'returns empty string when no contact info provided', () => {
		const result = getContactInfoValue( 'email', {} );
		expect( result ).toBe( '' );
	} );
} );

describe( 'getContactInfoPayload', () => {
	it( 'returns payload for email contact', () => {
		const result = getContactInfoPayload( 'email', emailContact );
		expect( result ).toEqual( {
			type: 'email',
			value: 'johndoe@example.com',
			site_ids: [],
		} );
	} );

	it( 'returns payload for SMS contact', () => {
		const result = getContactInfoPayload( 'sms', smsContact );
		expect( result ).toEqual( {
			type: 'sms',
			value: '+11234567890',
			number: '1234567890',
			country_code: 'US',
			country_numeric_code: '+1',
			site_ids: [],
		} );
	} );

	it( 'returns empty payload for unknown type', () => {
		const contactInfo = {
			name: 'John Doe',
		};
		// We want to test the case where the contact type is not known
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-ignore
		const result = getContactInfoPayload( 'unknownType', contactInfo );
		expect( result ).toEqual( {
			type: 'unknownType',
			value: '',
			site_ids: [],
		} );
	} );
} );

describe( 'isMatchingContactInfo', () => {
	it( 'returns true for matching email contact info', () => {
		const result = isMatchingContactInfo(
			'email',
			emailContactWithVerifiedKey,
			emailContactWithVerifiedKey
		);
		expect( result ).toBe( true );
	} );

	it( 'returns true for matching SMS contact info', () => {
		const result = isMatchingContactInfo(
			'sms',
			smsContactWithVerifiedKey,
			smsContactWithVerifiedKey
		);
		expect( result ).toBe( true );
	} );

	it( 'returns false for non-matching contact info', () => {
		const result = isMatchingContactInfo(
			'email',
			emailContactWithVerifiedKey,
			nonExistingEmailContact
		);
		expect( result ).toBe( false );
	} );
} );

describe( 'isContactAlreadyExists', () => {
	it( 'returns true for existing email contact in the list', () => {
		const contacts = [ emailContactWithVerifiedKey ];
		const result = isContactAlreadyExists( 'email', contacts, emailContact );
		expect( result ).toBe( emailContactWithVerifiedKey );
	} );

	it( 'returns true for existing SMS contact in the list', () => {
		const contacts = [ smsContactWithVerifiedKey ];
		const result = isContactAlreadyExists( 'sms', contacts, smsContact );
		expect( result ).toBe( smsContactWithVerifiedKey );
	} );

	it( 'returns false for non-existing contact in the list', () => {
		const contacts = [ emailContactWithVerifiedKey ];
		const contactInfo = {
			name: 'Jane Smith',
			email: 'janesmith@example.com',
		};
		const result = isContactAlreadyExists( 'email', contacts, contactInfo );
		expect( result ).toBeUndefined();
	} );
} );

describe( 'removeFromContactList', () => {
	it( 'removes existing email contact from the list', () => {
		const contacts = [ emailContactWithVerifiedKey ];
		const updatedContacts = removeFromContactList( 'email', contacts, emailContactWithVerifiedKey );
		expect( updatedContacts ).toEqual( [] );
	} );

	it( 'removes existing SMS contact from the list', () => {
		const contacts = [ smsContactWithVerifiedKey ];
		const updatedContacts = removeFromContactList( 'sms', contacts, smsContactWithVerifiedKey );
		expect( updatedContacts ).toEqual( [] );
	} );

	it( 'does not remove non-existing contact from the list', () => {
		const contacts = [ emailContactWithVerifiedKey ];
		const updatedContacts = removeFromContactList( 'email', contacts, nonExistingEmailContact );
		expect( updatedContacts ).toEqual( contacts );
	} );
} );

describe( 'addToContactList', () => {
	it( 'adds a new email contact to the list as verified', () => {
		const contacts = [];
		const asVerified = true;
		const updatedContacts = addToContactList( 'email', contacts, emailContact, asVerified );
		expect( updatedContacts ).toContainEqual( { ...emailContact, verified: true } );
	} );

	it( 'adds a new SMS contact to the list as not verified', () => {
		const contacts = [];
		const asVerified = false;
		const updatedContacts = addToContactList( 'sms', contacts, smsContact, asVerified );
		expect( updatedContacts ).toContainEqual( { ...smsContact, verified: false } );
	} );

	it( 'updates an existing email contact to verified', () => {
		const contacts = [ emailContactWithVerifiedKey ];
		const asVerified = true;
		const updatedContacts = addToContactList(
			'email',
			contacts,
			emailContactWithVerifiedKey,
			asVerified
		);
		expect( updatedContacts ).toContainEqual( { ...emailContactWithVerifiedKey, verified: true } );
	} );
} );

describe( 'isValidContactInfo', () => {
	it( 'returns true for valid email', () => {
		expect( isValidContactInfo( 'email', emailContact ) ).toBe( true );
	} );
	const invalidEmailContact = {
		name: 'John Doe',
		email: 'invalid-email',
		id: 'invalid-email',
	};
	it( 'returns false for invalid email', () => {
		expect( isValidContactInfo( 'email', invalidEmailContact ) ).toBe( false );
	} );
} );
