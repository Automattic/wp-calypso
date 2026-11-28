/**
 * Response from GET /sites/%s/features/
 * Returns site-specific features data
 */
export interface SiteFeaturesResponse {
	/** Array of currently active feature slugs for the site */
	active: string[];

	/**
	 * Map of available features to the plans that would unlock them, the site's current plan excluded
	 * Key: feature slug
	 * Value: product slugs of those plans
	 */
	available: Record< string, string[] >;
}
