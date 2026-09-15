/**
 * The subset of a site that Launchpad reads. Kept local so the package does not
 * depend on `@automattic/data-stores` for a type: a full `SiteDetails` still
 * satisfies it structurally.
 */
export interface LaunchpadSite {
	slug?: string;
	URL?: string;
	options?: {
		site_intent?: string;
		site_goals?: string[];
	};
}
