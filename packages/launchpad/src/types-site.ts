/** The subset of a site Launchpad reads. A full `SiteDetails` satisfies it. */
export interface LaunchpadSite {
	slug?: string;
	URL?: string;
	options?: {
		site_intent?: string;
		site_goals?: string[];
	};
}
