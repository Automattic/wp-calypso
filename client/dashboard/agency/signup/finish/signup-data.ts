import { getQueryArg } from '@wordpress/url';
import type { AgencyCreateRequest } from '@automattic/api-core';

export interface SignupData {
	request: AgencyCreateRequest;
	acquisition: Record< string, string >;
}

// Where the classic signup form leaves its answers before sending a logged-out
// visitor to log in. Its shape is the classic form's, so it's read field by field.
const SIGNUP_DATA_KEY = 'a4aSignupFormData';

const sanitizeString = ( value: unknown ): string => {
	if ( typeof value !== 'string' ) {
		return '';
	}
	return value.trim().replace( /[^\p{L}\p{N}\s._+-]/gu, '' );
};

const sanitizeStringArray = ( value: unknown ): string[] => {
	if ( ! Array.isArray( value ) ) {
		return [];
	}
	return value.map( sanitizeString ).filter( Boolean );
};

const sanitizeUrl = ( value: string | null ): string => {
	if ( ! value ) {
		return '';
	}
	const url = value.trim().toLowerCase();
	const isValidUrl =
		url.length > 3 &&
		/^(https?:\/\/)?([a-z0-9-]+\.)+[a-z]{2,}(:[0-9]{1,5})?(\/[^\s]*)?$/i.test( url );
	return isValidUrl ? url : '';
};

const sanitizePhone = ( value: string | null ): string => {
	return value ? value.replace( /[^0-9+\-()]/g, '' ) : '';
};

const sanitizeExpansionPlanned = ( value: unknown ): 'Yes' | 'No' | undefined => {
	return value === 'Yes' || value === 'No' ? value : undefined;
};

/**
 * Reads the signup answers that the agencies marketing site sends in the query string.
 * Arrays come as PHP-style keys (`services_offered[]=…`), hence `getQueryArg()`.
 */
export function getSignupDataFromSearch( searchStr: string ): SignupData | null {
	const query = searchStr.startsWith( '?' ) ? searchStr : `?${ searchStr }`;
	const params = new URLSearchParams( query );

	if ( ! params.get( 'first_name' ) || ! params.get( 'last_name' ) ) {
		return null;
	}

	return {
		request: {
			first_name: sanitizeString( params.get( 'first_name' ) ),
			last_name: sanitizeString( params.get( 'last_name' ) ),
			agency_name: sanitizeString( params.get( 'agency_name' ) ),
			agency_url: sanitizeUrl( params.get( 'agency_url' ) ),
			agency_size: sanitizeString( params.get( 'agency_size' ) ),
			number_sites: sanitizeString( params.get( 'number_sites' ) ),
			user_type: sanitizeString( params.get( 'user_type' ) ),
			services_offered: sanitizeStringArray( getQueryArg( query, 'services_offered' ) ),
			products_offered: sanitizeStringArray( getQueryArg( query, 'products_offered' ) ),
			products_to_offer: sanitizeStringArray( getQueryArg( query, 'products_to_offer' ) ),
			expansion_planned: sanitizeExpansionPlanned( params.get( 'expansion_planned' ) ),
			address_line1: sanitizeString( params.get( 'address_line1' ) ),
			address_line2: sanitizeString( params.get( 'address_line2' ) ),
			address_city: sanitizeString( params.get( 'address_city' ) ),
			address_country: sanitizeString( params.get( 'address_country' ) ),
			address_state: sanitizeString( params.get( 'address_state' ) ),
			address_postal_code: sanitizeString( params.get( 'address_postal_code' ) ),
			phone_number: sanitizePhone( params.get( 'phone_number' ) ),
			referral_status: sanitizeString( params.get( 'referral_status' ) ),
			skip_hubspot: false,
		},
		acquisition: {},
	};
}

const asString = ( value: unknown ): string => ( typeof value === 'string' ? value : '' );

const asOptionalString = ( value: unknown ): string | undefined =>
	typeof value === 'string' ? value : undefined;

const asStringArray = ( value: unknown ): string[] =>
	Array.isArray( value ) ? value.filter( ( item ) => typeof item === 'string' ) : [];

const asStringRecord = ( value: unknown ): Record< string, string > => {
	if ( typeof value !== 'object' || value === null ) {
		return {};
	}
	return Object.fromEntries(
		Object.entries( value ).filter( ( entry ): entry is [ string, string ] => {
			return typeof entry[ 1 ] === 'string';
		} )
	);
};

function readStoredSignupData(): unknown {
	try {
		return JSON.parse( window.localStorage.getItem( SIGNUP_DATA_KEY ) ?? 'null' );
	} catch {
		return null;
	}
}

export function getSignupDataFromLocalStorage(): SignupData | null {
	const stored = readStoredSignupData();

	if ( typeof stored !== 'object' || stored === null ) {
		return null;
	}

	const data: Record< string, unknown > = { ...stored };
	if ( ! asString( data.firstName ) || ! asString( data.lastName ) ) {
		return null;
	}

	const phone: Record< string, unknown > =
		typeof data.phone === 'object' && data.phone !== null ? { ...data.phone } : {};

	return {
		request: {
			first_name: asString( data.firstName ),
			last_name: asString( data.lastName ),
			agency_name: asString( data.agencyName ),
			agency_url: asString( data.agencyUrl ),
			agency_size: asOptionalString( data.agencySize ),
			number_sites: asOptionalString( data.managedSites ),
			user_type: asString( data.userType ),
			initial_source: asOptionalString( data.initialSource ),
			services_offered: asStringArray( data.servicesOffered ),
			products_offered: asStringArray( data.productsOffered ),
			products_to_offer: asStringArray( data.productsToOffer ),
			expansion_planned: sanitizeExpansionPlanned( data.plansToOfferProducts ),
			address_line1: asString( data.line1 ),
			address_line2: asString( data.line2 ),
			address_city: asString( data.city ),
			address_country: asString( data.country ),
			address_state: asString( data.state ),
			address_postal_code: asString( data.postalCode ),
			phone_number: asString( phone.phoneNumber ) ? asString( phone.phoneNumberFull ) : '',
			referral_status: asOptionalString( data.referer ),
			skip_hubspot: data.skip_hubspot === true,
		},
		acquisition: asStringRecord( data.acquisition ),
	};
}

export function clearSignupDataFromLocalStorage() {
	try {
		window.localStorage.removeItem( SIGNUP_DATA_KEY );
	} catch {
		// Storage can be unavailable, for example in a private window. Nothing to clear then.
	}
}

export function getSignupTracksProps( { request, acquisition }: SignupData ) {
	return {
		first_name: request.first_name,
		last_name: request.last_name,
		name: request.agency_name,
		business_url: request.agency_url,
		agency_size: request.agency_size,
		managed_sites: request.number_sites,
		services_offered: request.services_offered.join( ',' ),
		products_offered: request.products_offered.join( ',' ),
		products_to_offer: request.products_to_offer.join( ',' ),
		expansion_planned: request.expansion_planned,
		city: request.address_city,
		line1: request.address_line1,
		line2: request.address_line2,
		country: request.address_country,
		postal_code: request.address_postal_code,
		state: request.address_state,
		referer: request.referral_status,
		...acquisition,
	};
}
