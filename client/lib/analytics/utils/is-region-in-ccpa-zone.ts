const CCPA_US_REGIONS = [
	'california', // CA
];

/**
 * Returns a boolean telling whether a region is in the CCPA zone.
 *
 * @param region The region to look for.
 * @returns Whether the region is in the GDPR zone
 */
export default function isRegionInCcpaZone( region: string | undefined ): boolean {
	return region !== undefined && CCPA_US_REGIONS.includes( region.toLowerCase() );
}
