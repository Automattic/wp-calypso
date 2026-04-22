import i18n from 'i18n-calypso';
import phone from 'phone';

// Valid NANP (North American) area codes that are assigned but not yet recognized by
// the bundled phone library metadata. Update this list when upgrading the phone library.
// See: https://www.nanpa.com/enas/geoAreaCodeNumberRptInput.do
const NANP_AREA_CODES_MISSING_FROM_LIBRARY = new Set( [
	'350', // California overlay, assigned 2022
] );

/**
 * Returns true if the number is a valid NANP (+1) number whose area code is
 * assigned but not yet present in the phone library's bundled metadata.
 */
function isValidMissingNanpAreaCode( phoneNumber ) {
	const match = phoneNumber.match( /^\+1([2-9]\d{2})\d{7}$/ );
	return match !== null && NANP_AREA_CODES_MISSING_FROM_LIBRARY.has( match[ 1 ] );
}

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

	// phone module validates mobile numbers; fall back to checking against known-valid
	// area codes missing from the library's bundled metadata.
	if ( ! phone( phoneNumber ).isValid && ! isValidMissingNanpAreaCode( phoneNumber ) ) {
		return {
			error: 'phone_number_invalid',
			message: i18n.translate( 'That phone number does not appear to be valid' ),
		};
	}

	return {
		info: 'phone_number_valid',
		message: i18n.translate( 'Valid phone number' ),
	};
}
