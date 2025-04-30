import { setGeoLocation } from '@automattic/number-formatters';
import { type UserData } from 'calypso/lib/user/user';

async function fetchCountryCode(): Promise< string > {
	try {
		const response = await fetch( 'https://public-api.wordpress.com/geo/' );
		const data = await response.json();
		return data.country_short ?? '';
	} catch {
		return '';
	}
}

/**
 * Initializes country code for localization and formatting libraries from the current user. If the
 * user is not logged in, it will fetch the country code from the geolocation API.
 * @param currentUser The current user.
 */
export async function setupCountryCode( currentUser: UserData | false ) {
	let countryCode = currentUser ? currentUser.user_ip_country_code : undefined;
	countryCode ??= await fetchCountryCode();

	if ( ! countryCode ) {
		return;
	}

	setGeoLocation( countryCode );
}
