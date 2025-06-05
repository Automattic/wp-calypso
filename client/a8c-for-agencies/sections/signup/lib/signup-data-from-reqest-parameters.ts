import { getQueryArg } from '@wordpress/url';
import { isValidUrl } from 'calypso/a8c-for-agencies/components/form/utils';
import { AgencyDetailsPayload } from '../agency-details-form/types';

/**
 * Sanitizes a string by removing special characters and trimming whitespace
 */
const sanitizeString = ( value: string | null ): string => {
	if ( ! value ) {
		return '';
	}
	return value.trim().replace( /[^\p{L}\p{N}\s._+-]/gu, '' );
};

const sanitizePlansToOfferProducts = ( value: string | null ): 'Yes' | 'No' | undefined => {
	if ( value && [ 'Yes', 'No' ].includes( value ) ) {
		return value as 'Yes' | 'No';
	}

	return undefined;
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
 * Sanitizes string array
 */
const sanitizeStringArray = ( values: string[] ): string[] => {
	if ( ! values ) {
		return [];
	}
	return values.map( ( item ) => sanitizeString( item ) ).filter( Boolean );
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
	const servicesOffered = sanitizeStringArray(
		( getQueryArg( window.location.href, 'services_offered' ) as string[] ) ?? []
	);
	const productsOffered = sanitizeStringArray(
		( getQueryArg( window.location.href, 'products_offered' ) as string[] ) ?? []
	);
	const productsToOffer = sanitizeStringArray(
		( getQueryArg( window.location.href, 'products_to_offer' ) as string[] ) ?? []
	);

	// Get phone number
	const phone = sanitizePhone( searchParams.get( 'phone_number' ) );

	const payload: AgencyDetailsPayload = {
		firstName: sanitizeString( searchParams.get( 'first_name' ) ),
		lastName: sanitizeString( searchParams.get( 'last_name' ) ),
		agencyName: sanitizeString( searchParams.get( 'agency_name' ) ),
		agencyUrl: sanitizeUrl( searchParams.get( 'agency_url' ) ),
		agencySize: sanitizeString( searchParams.get( 'agency_size' ) ),
		managedSites: sanitizeString( searchParams.get( 'number_sites' ) ),
		userType: sanitizeString( searchParams.get( 'user_type' ) ),
		servicesOffered,
		productsOffered,
		productsToOffer,
		plansToOfferProducts: sanitizePlansToOfferProducts( searchParams.get( 'expansion_planned' ) ),
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
