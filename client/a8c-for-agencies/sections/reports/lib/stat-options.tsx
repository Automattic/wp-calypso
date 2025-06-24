/**
 * Get stats options for the report
 */
export const getStatsOptions = (
	translate: ( key: string, args?: Record< string, unknown > ) => string
) => {
	return [
		{ label: translate( 'Visitors and Views in this timeframe' ), value: 'total_traffic' },
		{ label: translate( 'Top 5 posts' ), value: 'top_pages' },
		{ label: translate( 'Top 5 referrers' ), value: 'top_devices' },
		{ label: translate( 'Top 5 cities' ), value: 'top_locations' },
		{ label: translate( 'Device breakdown' ), value: 'device_breakdown' },
		{
			label: translate( 'Total Visitors and Views since the site was created' ),
			value: 'total_traffic_all_time',
		},
		{ label: translate( 'Most popular time of day' ), value: 'most_popular_time_of_day' },
		{ label: translate( 'Most popular day of week' ), value: 'most_popular_day_of_week' },
	];
};
