import { __ } from '@wordpress/i18n';
import phone from 'phone';

export function validatePhone( phoneNumber: string ) {
	const phoneNumberWithoutPlus = phoneNumber.replace( /\+/g, '' );

	if ( phoneNumberWithoutPlus.length === 0 ) {
		return {
			error: 'phone_number_empty',
			message: __( 'Please enter a phone number' ),
		};
	}

	if ( /[a-zA-Z]/.test( phoneNumber ) ) {
		return {
			error: 'phone_number_contains_letters',
			message: __( 'Phone numbers cannot contain letters' ),
		};
	}

	// The phone library silently strips extra plus signs, so reject them before validating.
	if ( ! /^\+?\d+$/.test( phoneNumber ) ) {
		return {
			error: 'phone_number_contains_special_characters',
			message: __( 'Phone numbers cannot contain special characters' ),
		};
	}

	if ( phoneNumberWithoutPlus.length < 8 ) {
		return {
			error: 'phone_number_too_short',
			message: __( 'This number is too short' ),
		};
	}

	// phone module validates mobile numbers
	if ( ! phone( phoneNumber ).isValid ) {
		return {
			error: 'phone_number_invalid',
			message: __( 'That phone number does not appear to be valid' ),
		};
	}

	return {
		info: 'phone_number_valid',
		message: __( 'Valid phone number' ),
	};
}
