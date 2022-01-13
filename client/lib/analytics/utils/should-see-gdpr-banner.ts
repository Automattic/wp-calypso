import { isWpMobileApp } from 'calypso/lib/mobile-app';
import getCountryCodeFromCookies from './get-country-code-from-cookies';
import isCountryInGdprZone from './is-country-in-gdpr-zone';

/**
 * Returns a boolean indicating whether a GDPR banner should be shown.
 *
 * Defaults to `false` if the country code is unknown.
 *
 * @param cookies The cookies to read user data from.
 * @param defaultCountryCode A default country code to fall back to.
 *
 * @returns Whether the current user could be in the GDPR zone
 */
export default function shouldSeeGdprBanner(
	cookies: Record< string, string >,
	defaultCountryCode?: string
) {
	cookies = cookies || {};

	if ( cookies.sensitive_pixel_option === 'yes' || cookies.sensitive_pixel_option === 'no' ) {
		return false;
	}

	if ( isWpMobileApp() ) {
		return false;
	}

	const countryCode = getCountryCodeFromCookies( cookies, defaultCountryCode );
	if ( countryCode && isCountryInGdprZone( countryCode ) ) {
		return true;
	}

	return false;
}
