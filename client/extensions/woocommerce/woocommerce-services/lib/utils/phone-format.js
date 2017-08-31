/**
 * External dependencies
 */
import { parse, isValidNumber, format } from 'libphonenumber-js';

export const isValidPhone = ( phoneNumber, countryCode ) => {
	return isValidNumber( phoneNumber, countryCode );
};

export const getPlainPhoneNumber = ( phoneNumber, countryCode ) => {
	return parse( phoneNumber, countryCode ).phone || phoneNumber;
};

export const formatPhoneForDisplay = ( phoneNumber, countryCode ) => {
	if ( ! isValidPhone( phoneNumber, countryCode ) ) {
		return phoneNumber;
	}
	return format( phoneNumber, countryCode, 'National' );
};
