export interface SiteEngagementStatsResponse {
	/**
	 * Array of tuples in the format: [date, visitors, views, likes, comments],
	 * e.g. `[ '2025-04-13', 1, 3, 0, 0 ]`.
	 */
	data: Array< [ string, number, number, number, number ] >;
}
