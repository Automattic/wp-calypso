import EmailValidator from 'email-validator';
import {
	AllowedMonitorContactTypes,
	RequestVerificationCodeParams,
	StateMonitorSettingsEmail,
	StateMonitorSettingsSMS,
} from '../../sites-overview/types';
import { ContactInfo } from './types';

export const isCompleteContactInfo = (
	type: AllowedMonitorContactTypes,
	contact: ContactInfo,
	withVerificationCode: boolean
) => {
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

export const getDefaultContactInfo = (
	type: AllowedMonitorContactTypes,
	contact?: StateMonitorSettingsEmail | StateMonitorSettingsSMS
) => {
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

export const getContactInfoValue = (
	type: AllowedMonitorContactTypes,
	contactInfo: ContactInfo
) => {
	if ( type === 'email' ) {
		return contactInfo.email ?? '';
	}

	if ( type === 'sms' ) {
		return contactInfo.phoneNumberFull ?? '';
	}

	return '';
};

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
			value: `${ contactInfo.countryNumericCode }${ contactInfo.phoneNumber }`,
			number: contactInfo.phoneNumber,
			country_code: contactInfo.countryCode,
			country_numeric_code: contactInfo.countryNumericCode,
			site_ids: [],
		};
	}

	return { type, value: '', site_ids: [] };
};

export const removeFromContactList = (
	type: AllowedMonitorContactTypes,
	contacts: Array< StateMonitorSettingsEmail | StateMonitorSettingsSMS >,
	contactToRemove: StateMonitorSettingsEmail | StateMonitorSettingsSMS
) => {
	return contacts.filter( ( contact ) => {
		if ( type === 'email' ) {
			return (
				( contact as StateMonitorSettingsEmail ).email !==
				( contactToRemove as StateMonitorSettingsEmail ).email
			);
		}

		if ( type === 'sms' ) {
			return (
				( contact as StateMonitorSettingsSMS ).phoneNumberFull !==
				( contactToRemove as StateMonitorSettingsSMS ).phoneNumberFull
			);
		}

		return true;
	} );
};

export const isContactAlreadyExists = (
	type: AllowedMonitorContactTypes,
	contacts: Array< StateMonitorSettingsEmail | StateMonitorSettingsSMS >,
	contactInfo: ContactInfo
) => {
	return contacts.find( ( contact ) => {
		if ( type === 'email' ) {
			return (
				( contact as StateMonitorSettingsEmail ).email ===
				( contactInfo as StateMonitorSettingsEmail ).email
			);
		}

		if ( type === 'sms' ) {
			return (
				( contact as StateMonitorSettingsSMS ).phoneNumberFull ===
				( contactInfo as StateMonitorSettingsSMS ).phoneNumberFull
			);
		}

		return false;
	} );
};

export const isMatchingContactInfo = (
	type: AllowedMonitorContactTypes,
	contact: StateMonitorSettingsEmail | StateMonitorSettingsSMS,
	contactInfo: ContactInfo
) => {
	if ( type === 'email' ) {
		return ( contact as StateMonitorSettingsEmail ).email === contactInfo.email;
	}

	if ( type === 'sms' ) {
		return ( contact as StateMonitorSettingsSMS ).phoneNumberFull === contactInfo.phoneNumberFull;
	}

	return false;
};

export const isValidContactInfo = ( type: AllowedMonitorContactTypes, contact: ContactInfo ) => {
	if ( type === 'email' ) {
		return contact.email && EmailValidator.validate( contact.email );
	}

	return false;
};
