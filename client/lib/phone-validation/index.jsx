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
		// Fallback: validate North American Numbering Plan (NANP) numbers with regex.
		// The phone library may have outdated metadata and reject newer valid area codes
		// (e.g., area code 350, assigned to California in 2022).
		// NANP format: +1 followed by 10 digits (3 area code + 7 local),
		// where the area code's first digit is 2-9.
		const nanpRegex = /^\+1[2-9]\d{2}\d{7}$/;
		if ( ! nanpRegex.test( phoneNumber ) ) {
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
