const STS_US_REGIONS = [
	'california', // CA
	'florida', // FL
	'maryland', // MD
	'massachusetts', // MA
	'new hampshire', // NH
	'nevada', // NV
	'pennsylvania', // PA
	'washington', // WA
];

/**
 * Returns a boolean telling whether a region is in an STS (session tracking sensitive) zone.
 * @param countryCode The country code to check (it needs to be 'US' for STS to apply)
 * @param region The region to look for.
 * @returns Whether the region is in the STS zone
 */

export default function isRegionInStsZone( countryCode?: string, region?: string ): boolean {
	if ( 'US' !== countryCode ) {
		return false;
	}
	if ( 'unknown' === region ) {
		// If we don't know the region, assume it's not in an STS zone.
		return true;
	}

	return region !== undefined && STS_US_REGIONS.includes( region.toLowerCase() );
}
