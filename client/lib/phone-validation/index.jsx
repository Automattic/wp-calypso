import i18n from 'i18n-calypso';
import phone from 'phone';

export default function ( phoneNumber ) {
	const phoneNumberWithoutPlus = phoneNumber.replace( /\+/, '' );

	if ( phoneNumberWithoutPlus.length === 0 ) {
		return {
			error: 'phone_number_empty',
			message: i18n.translate( 'Please enter a phone number' ),
		};
	}

	if ( phoneNumberWithoutPlus.length < 8 ) {
		return {
			error: 'phone_number_too_short',
			message: i18n.translate( 'This number is too short' ),
		};
	}

	if ( phoneNumber.search( /[a-z,A-Z]/ ) > -1 ) {
		return {
			error: 'phone_number_contains_letters',
			message: i18n.translate( 'Phone numbers cannot contain letters' ),
		};
	}

	if ( phoneNumber.search( /[^0-9,+]/ ) > -1 ) {
		return {
			error: 'phone_number_contains_special_characters',
			message: i18n.translate( 'Phone numbers cannot contain special characters' ),
		};
	}

	// phone module validates mobile numbers
	if ( ! phone( phoneNumber ).isValid ) {
		// The phone library may have outdated metadata for recently assigned US/NANP area codes.
		// Fall back to structural NANP format validation: country code +1, area code starts with 2–9,
		// followed by 9 more digits (e.g., area code 350 assigned to California in 2022).
		const isValidNanp = /^\+1[2-9]\d{9}$/.test( phoneNumber );
		if ( ! isValidNanp ) {
			return {
				error: 'phone_number_invalid',
				message: i18n.translate( 'That phone number does not appear to be valid' ),
			};
		}
	}

	return {
		info: 'phone_number_valid',
		message: i18n.translate( 'Valid phone number' ),
	};
}
