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
export default function isRegionInCcpaZone(
	countryCode: string | undefined,
	region: string | undefined
): boolean {
	if ( 'US' !== countryCode ) {
		return false;
	}

	return region !== undefined && CCPA_US_REGIONS.includes( region.toLowerCase() );
}
