import { AgencyDetailsPayload } from '../agency-details-form/types';

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
	const servicesOffered = searchParams.get( 'services_offered' )?.split( ',' ) ?? [];
	const productsOffered = searchParams.get( 'products_offered' )?.split( ',' ) ?? [];

	// Get phone number
	const phoneNumber = searchParams.get( 'phone_number' );
	const phone = phoneNumber
		? {
				phoneNumberFull: phoneNumber,
				phoneNumber: phoneNumber,
		  }
		: undefined;

	const payload: AgencyDetailsPayload = {
		firstName: searchParams.get( 'first_name' ) ?? '',
		lastName: searchParams.get( 'last_name' ) ?? '',
		agencyName: searchParams.get( 'agency_name' ) ?? '',
		agencyUrl: searchParams.get( 'agency_url' ) ?? '',
		managedSites: searchParams.get( 'number_sites' ) ?? '',
		userType: searchParams.get( 'user_type' ) ?? '',
		servicesOffered,
		productsOffered,
		line1: searchParams.get( 'address_line1' ) ?? '',
		line2: searchParams.get( 'address_line2' ) ?? '',
		city: searchParams.get( 'address_city' ) ?? '',
		country: searchParams.get( 'address_country' ) ?? '',
		state: searchParams.get( 'address_state' ) ?? '',
		postalCode: searchParams.get( 'address_postal_code' ) ?? '',
		phone,
		referer: searchParams.get( 'referral_status' ),
	};

	return payload;
}
