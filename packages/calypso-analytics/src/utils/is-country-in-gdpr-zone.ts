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
 * Returns a boolean telling whether a country is in the GDPR zone.
 * @param countryCode The country code to look for.
 * @returns Whether the country is in the GDPR zone
 */
export default function isCountryInGdprZone( countryCode: string | undefined ): boolean {
	if ( 'unknown' === countryCode || undefined === countryCode ) {
		// Fail safe: if we don't know the countryCode, assume it's in the Gdpr zone.
		return true;
	}
	return GDPR_COUNTRIES.includes( countryCode );
}
