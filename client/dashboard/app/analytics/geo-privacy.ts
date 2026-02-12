/**
 * Returns a boolean telling whether a country is in the GDPR zone.
 * @param countryCode The country code to look for.
 * @returns Whether the country is in the GDPR zone
 */
export function isCountryInGdprZone( countryCode: string | undefined ): boolean {
	if ( 'unknown' === countryCode || undefined === countryCode ) {
		// Fail safe: if we don't know the countryCode, assume it's in the Gdpr zone.
		return true;
	}
	return [
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
	].includes( countryCode );
}

/**
 * Returns a boolean telling whether a region is in the CCPA zone.
 * @param countryCode The country code to check (it needs to be 'US' for CCPA to apply)
 * @param region The region to look for.
 * @returns Whether the region is in the GDPR zone
 */
export function isRegionInCcpaZone(
	countryCode: string | undefined,
	region: string | undefined
): boolean {
	if ( 'US' !== countryCode ) {
		return false;
	}
	if ( 'unknown' === region || undefined === region ) {
		// Fail safe: if we don't know the region, assume it's in the CCPA zone.
		return true;
	}

	return [
		'california', // CA
		'colorado', // CO
		'connecticut', // CT
		'delaware', // DE
		'florida', // FL
		'indiana', // IN
		'iowa', // IA
		'kentucky', // KY
		'maryland', // MD
		'minnesota', // MN
		'montana', // MT
		'nebraska', // NE
		'new hampshire', // NH
		'new jersey', // NJ
		'oregon', // OR
		'rhode island', // RI
		'tennessee', // TN
		'texas', // TX
		'utah', // UT
		'virginia', // VA
	].includes( region.toLowerCase() );
}
