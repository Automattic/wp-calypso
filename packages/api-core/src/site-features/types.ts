/**
 * Response from GET /sites/%s/features/
 * Returns site-specific features data
 */
export interface SiteFeaturesResponse {
	/** Array of currently active feature slugs for the site */
	active: string[];

	/**
	 * Map of available features to the product slug required to unlock them
	 * Key: feature slug
	 * Value: product slug needed to enable this feature
	 */
	available: Record< string, string >;
}
