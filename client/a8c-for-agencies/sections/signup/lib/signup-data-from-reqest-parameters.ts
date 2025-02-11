import { isValidUrl } from 'calypso/a8c-for-agencies/components/form/utils';
import { AgencyDetailsPayload } from '../agency-details-form/types';

/**
 * Sanitizes a string by removing special characters and trimming whitespace
 */
const sanitizeString = ( value: string | null ): string => {
	if ( ! value ) {
		return '';
	}
	return value.trim().replace( /[^\p{L}\p{N}\s._-]/gu, '' );
};

/**
 * Sanitizes a URL by validating and cleaning it
 */
const sanitizeUrl = ( url: string | null ): string => {
	if ( ! url ) {
		return '';
	}
	const cleanedUrl = url.trim().toLowerCase();
	return isValidUrl( cleanedUrl ) ? cleanedUrl : '';
};

/**
 * Validates and sanitizes phone number
 */
const sanitizePhone = ( phoneNumber: string | null ) => {
	if ( ! phoneNumber ) {
		return undefined;
	}
	// Remove everything except digits and common phone number characters
	const sanitized = phoneNumber.replace( /[^0-9+\-()]/g, '' );
	return sanitized
		? {
				phoneNumberFull: sanitized,
				phoneNumber: sanitized,
		  }
		: undefined;
};

/**
 * Sanitizes comma-separated values into an array
 */
const sanitizeArrayFromString = ( value: string | null ): string[] => {
	if ( ! value ) {
		return [];
	}
	return value
		.split( ',' )
		.map( ( item ) => sanitizeString( item ) )
		.filter( Boolean );
};

export function getSignupDataFromRequestParameters(): AgencyDetailsPayload | null {
	const searchParams = new URLSearchParams( window.location.search );

	// Return null if no parameters are present
	if ( ! searchParams.get( 'first_name' ) || ! searchParams.get( 'last_name' ) ) {
		return null;
	}

	// Return null if no parameters are present
	if ( searchParams.size === 0 ) {
		return null;
	}

	// Parse arrays from comma-separated strings
	const servicesOffered = sanitizeArrayFromString( searchParams.get( 'services_offered' ) );
	const productsOffered = sanitizeArrayFromString( searchParams.get( 'products_offered' ) );

	// Get phone number
	const phone = sanitizePhone( searchParams.get( 'phone_number' ) );

	const payload: AgencyDetailsPayload = {
		firstName: sanitizeString( searchParams.get( 'first_name' ) ),
		lastName: sanitizeString( searchParams.get( 'last_name' ) ),
		agencyName: sanitizeString( searchParams.get( 'agency_name' ) ),
		agencyUrl: sanitizeUrl( searchParams.get( 'agency_url' ) ),
		managedSites: sanitizeString( searchParams.get( 'number_sites' ) ),
		userType: sanitizeString( searchParams.get( 'user_type' ) ),
		servicesOffered,
		productsOffered,
		line1: sanitizeString( searchParams.get( 'address_line1' ) ),
		line2: sanitizeString( searchParams.get( 'address_line2' ) ),
		city: sanitizeString( searchParams.get( 'address_city' ) ),
		country: sanitizeString( searchParams.get( 'address_country' ) ),
		state: sanitizeString( searchParams.get( 'address_state' ) ),
		postalCode: sanitizeString( searchParams.get( 'address_postal_code' ) ),
		phone,
		referer: sanitizeString( searchParams.get( 'referral_status' ) ),
	};

	return payload;
}
