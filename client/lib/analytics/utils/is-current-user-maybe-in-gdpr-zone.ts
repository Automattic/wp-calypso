const GDPR_COUNTRIES = [
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

/**
 * Returns a boolean telling whether the current user could be in the GDPR zone.
 *
 * @param cookies The cookies to read user data from.
 *
 * @returns Whether the current user could be in the GDPR zone
 */
export default function isCurrentUserMaybeInGdprZone( cookies: Record< string, string > ): boolean {
	const countryCode = ( cookies || {} ).country_code;

	return ! countryCode || 'unknown' === countryCode || GDPR_COUNTRIES.includes( countryCode );
}
