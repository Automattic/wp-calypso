import EmailValidator from 'email-validator';
import {
	AllowedMonitorContactTypes,
	RequestVerificationCodeParams,
	StateMonitorSettingsEmail,
	StateMonitorSettingsSMS,
	StateMonitoringSettingsContact,
} from '../../sites-overview/types';
import { ContactInfo } from './types';

/*
 * Returns true if the contact info is complete.
 * If withVerificationCode is true, it will also check if the verification code is present.
 *
 * @param {AllowedMonitorContactTypes} type
 * @param {ContactInfo} contact
 * @param {boolean} withVerificationCode
 *
 * @returns {boolean}
 */
export const isCompleteContactInfo = (
	type: AllowedMonitorContactTypes,
	contact: ContactInfo,
	withVerificationCode: boolean
): boolean => {
	if ( type === 'email' ) {
		return !! (
			contact.name &&
			contact.email &&
			( ! withVerificationCode || contact.verificationCode )
		);
	}

	if ( type === 'sms' ) {
		return !! (
			contact.name &&
			contact.countryCode &&
			contact.phoneNumber &&
			( ! withVerificationCode || contact.verificationCode )
		);
	}

	return false;
};

/*
 * Returns the default contact info values from existing contact.
 *
 * @param {AllowedMonitorContactTypes} type
 * @param {unknown} contact
 *
 * @returns {ContactInfo}
 */
export const getDefaultContactInfo = (
	type: AllowedMonitorContactTypes,
	contact?: unknown
): ContactInfo => {
	if ( contact && type === 'sms' ) {
		const { name, countryCode, countryNumericCode, phoneNumber, phoneNumberFull } =
			contact as StateMonitorSettingsSMS;
		return {
			name: name ?? '',
			countryCode: countryCode ?? '',
			countryNumericCode: countryNumericCode ?? '',
			phoneNumber: phoneNumber ?? '',
			phoneNumberFull: phoneNumberFull ?? '',
			id: phoneNumberFull ?? '',
		};
	}

	if ( contact && type === 'email' ) {
		const { name, email } = contact as StateMonitorSettingsEmail;

		return {
			name: name ?? '',
			email: email ?? '',
			id: email ?? '',
		};
	}

	return {
		name: '',
	};
};

/*
 * Returns the value of a Contact info from given type. (e.g. email, phone number, etc.)
 * If the type is not supported, it will return the name.
 *
 * @param {AllowedMonitorContactTypes} type
 * @param {ContactInfo} contactInfo
 *
 * @returns {string}
 */
export const getContactInfoValue = (
	type: AllowedMonitorContactTypes,
	contactInfo: Partial< ContactInfo >
): string => {
	if ( type === 'email' ) {
		return contactInfo.email ?? '';
	}

	if ( type === 'sms' ) {
		return contactInfo.phoneNumberFull ?? '';
	}

	return contactInfo.name ?? '';
};

/*
 * Returns the payload of a contact info that will be submitted to the backend endpoint.
 * Site ids are set to empty array and will be supplied else where.
 *
 * @param {AllowedMonitorContactTypes} type
 * @param {ContactInfo} contactInfo
 *
 * @returns {payload}
 */
export const getContactInfoPayload = (
	type: AllowedMonitorContactTypes,
	contactInfo: ContactInfo
): RequestVerificationCodeParams => {
	if ( type === 'email' ) {
		return { type, value: contactInfo.email ?? '', site_ids: [] };
	}

	if ( type === 'sms' ) {
		return {
			type,
			value: contactInfo.phoneNumberFull ?? '',
			number: contactInfo.phoneNumber,
			country_code: contactInfo.countryCode,
			country_numeric_code: contactInfo.countryNumericCode,
			site_ids: [],
		};
	}

	return { type, value: '', site_ids: [] };
};

/*
 * Returns true if a contact object matches a contact info object.
 *
 * @param {AllowedMonitorContactTypes} type
 * @param {T} contact
 * @param {ContactInfo} contactInfo
 *
 * @returns {boolean}
 */
export const isMatchingContactInfo = (
	type: AllowedMonitorContactTypes,
	contact: StateMonitoringSettingsContact,
	contactInfo: ContactInfo
) => {
	return getContactInfoValue( type, contact ) === getContactInfoValue( type, contactInfo );
};

/*
 * Returns true if a contact info already exist in the contact list.
 *
 * @param {AllowedMonitorContactTypes} type
 * @param {Array} contacts
 * @param {ContactInfo} contactInfo
 *
 * @returns {boolean}
 */
export const isContactAlreadyExists = (
	type: AllowedMonitorContactTypes,
	contacts: Array< StateMonitoringSettingsContact >,
	contact: ContactInfo
) => {
	return contacts.find( ( item ) => {
		return isMatchingContactInfo( type, item, contact );
	} );
};

/*
 * Helper function to remove a contact from a contact list.
 *
 * @param {AllowedMonitorContactTypes} type
 * @param {Array} contacts
 * @param {ContactInfo} contactInfo
 */
export const removeFromContactList = (
	type: AllowedMonitorContactTypes,
	contacts: Array< StateMonitoringSettingsContact >,
	contact: StateMonitoringSettingsContact
) => {
	return contacts.filter( ( item ) => ! isMatchingContactInfo( type, item, contact ) );
};

/*
 * Helper function to add a contact to a contact list. if asVerified is true. Add the contact as verified.
 *
 * @param {AllowedMonitorContactTypes} type
 * @param {Array} contacts
 * @param {ContactInfo} contactInfo
 * @param {boolean} asVerified
 */
export const addToContactList = (
	type: AllowedMonitorContactTypes,
	contacts: Array< StateMonitoringSettingsContact >,
	contact: ContactInfo,
	asVerified: boolean
) => {
	let isANewContact = true;
	const updatedContactList = contacts.map( ( item ) => {
		// We need to compare it with the id because it points to the original contact value.
		if ( contact.id && getContactInfoValue( type, item ) === contact.id ) {
			isANewContact = false;
			return {
				...contact,
				verified: asVerified,
			};
		}

		return item;
	} );

	if ( isANewContact ) {
		updatedContactList.push( {
			...contact,
			verified: asVerified,
		} );
	}

	return updatedContactList as Array< StateMonitoringSettingsContact >;
};

/*
 * Returns true if a contact info has valid value.
 *
 * @param {AllowedMonitorContactTypes} type
 * @param {Array} contacts
 *
 * @returns {boolean}
 */
export const isValidContactInfo = ( type: AllowedMonitorContactTypes, contact: ContactInfo ) => {
	if ( type === 'email' ) {
		return contact.email && EmailValidator.validate( contact.email );
	}

	return false;
};
