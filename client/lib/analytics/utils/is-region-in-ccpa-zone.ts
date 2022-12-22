const CCPA_US_REGIONS = [
	'california', // CA
	'colorado', // CO
	'connecticut', // CT
	'utah', // UT
	'virginia', // VA
];

/**
 * Returns a boolean telling whether a region is in the CCPA zone.
 *
 * @param countryCode The country code to check (it needs to be 'US' for CCPA to apply)
 * @param region The region to look for.
 * @returns Whether the region is in the GDPR zone
 */
export default function isRegionInCcpaZone( countryCode?: string, region?: string ): boolean {
	if ( 'US' !== countryCode ) {
		return false;
	}
	if ( 'unknown' === region ) {
		// Fail safe: if we don't know the region, assume it's in the CCPA zone.
		return true;
	}

	return region !== undefined && CCPA_US_REGIONS.includes( region.toLowerCase() );
}
