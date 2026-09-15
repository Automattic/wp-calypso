/** A full `SiteDetails` satisfies this. */
export interface MinimumSite {
	slug?: string;
	URL?: string;
	options?: {
		site_intent?: string;
		site_goals?: string[];
	};
}
