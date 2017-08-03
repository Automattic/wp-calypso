/**
 * External dependencies
 */
var phone = require( 'phone' ),
	i18n = require( 'i18n-calypso' );

module.exports = function( phoneNumber ) {
	var phoneNumberWithoutPlus = phoneNumber.replace( /\+/, '' );

	if ( phoneNumberWithoutPlus.length === 0 ) {
		return {
			error: 'phone_number_empty',
			message: i18n.translate( 'Please enter a phone number' )
		};
	}

	if ( phoneNumberWithoutPlus.length < 8 ) {
		return {
			error: 'phone_number_too_short',
			message: i18n.translate( 'This number is too short' )
		};
	}

	if ( phoneNumber.search( /[a-z,A-Z]/ ) > -1 ) {
		return {
			error: 'phone_number_contains_letters',
			message: i18n.translate( 'Phone numbers cannot contain letters' )
		};
	}

	if ( phoneNumber.search( /[^0-9,\+]/ ) > -1 ) {
		return {
			error: 'phone_number_contains_special_characters',
			message: i18n.translate( 'Phone numbers cannot contain special characters' )
		};
	}

	if ( phone( phoneNumber ).length ) {
		return {
			info: 'phone_number_valid',
			message: i18n.translate( 'Valid phone number' )
		};
	} else {
		return {
			error: 'phone_number_invalid',
			message: i18n.translate( 'That phone number does not appear to be valid' )
		};
	}

};
