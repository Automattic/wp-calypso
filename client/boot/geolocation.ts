import { setGeoLocation } from '@automattic/number-formatters';
import cookie from 'cookie';

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
 */
export async function setupCountryCode() {
	const cookies = cookie.parse( document.cookie );
	const countryCode = cookies.country_code ?? ( await fetchCountryCode() );
	if ( countryCode && countryCode !== 'unknown' ) {
		setGeoLocation( countryCode );
	}
}
