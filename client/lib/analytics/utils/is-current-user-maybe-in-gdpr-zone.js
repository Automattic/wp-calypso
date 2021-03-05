/**
 * External dependencies
 */
import cookie from 'cookie';
import { includes } from 'lodash';

/**
 * Returns a boolean telling whether the current user could be in the GDPR zone.
 *
 * @returns {boolean} Whether the current user could be in the GDPR zone
 */
export default function isCurrentUserMaybeInGdprZone() {
	const cookies = cookie.parse( document.cookie );
	const countryCode = cookies.country_code;

	if ( ! countryCode || 'unknown' === countryCode ) {
		return true;
	}

	const gdprCountries = [
		// European Member countries
		'AT', // Austria
		'BE', // Belgium
		'BG', // Bulgaria
		'CY', // Cyprus
		'CZ', // Czech Republic
		'DE', // Germany
		'DK', // Denmark
		'EE', // Estonia
		'ES', // Spain
		'FI', // Finland
		'FR', // France
		'GR', // Greece
		'HR', // Croatia
		'HU', // Hungary
		'IE', // Ireland
		'IT', // Italy
		'LT', // Lithuania
		'LU', // Luxembourg
		'LV', // Latvia
		'MT', // Malta
		'NL', // Netherlands
		'PL', // Poland
		'PT', // Portugal
		'RO', // Romania
		'SE', // Sweden
		'SI', // Slovenia
		'SK', // Slovakia
		'GB', // United Kingdom
		// Single Market Countries that GDPR applies to
		'CH', // Switzerland
		'IS', // Iceland
		'LI', // Liechtenstein
		'NO', // Norway
	];

	return includes( gdprCountries, countryCode );
}
