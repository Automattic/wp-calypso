import useUTMMetricTopPostsQuery from '../hooks/use-utm-metric-top-posts-query';
import useUTMMetricsQuery from '../hooks/use-utm-metrics-query';
import StatsModuleDataQuery from '../stats-module/stats-module-data-query';
import statsStrings from '../stats-strings';

const StatsModuleUTM = ( { siteId, period, postId, query, summary } ) => {
	const moduleStrings = statsStrings();

	// Fetch UTM metrics with switched UTM parameters.
	const { isFetching: isFetchingMetricsAndTopPosts, metrics } = useUTMMetricsQuery(
		siteId,
		'utm_source,utm_medium',
		postId
	);
	// Fetch top posts for all UTM metric items.
	const { topPosts } = useUTMMetricTopPostsQuery( siteId, 'utm_source,utm_medium', metrics );

	// Combine metrics with top posts.
	const data = metrics.map( ( metric ) => {
		const paramValues = metric.paramValues;
		const children = topPosts[ paramValues ] || [];

		return {
			...metric,
			children,
		};
	} );

	const hideSummaryLink = postId !== undefined || summary === true;

	return (
		<StatsModuleDataQuery
			data={ data }
			path="utm"
			className="stats-module-utm"
			moduleStrings={ moduleStrings.utm }
			period={ period }
			query={ query }
			isLoading={ isFetchingMetricsAndTopPosts ?? true }
			hideSummaryLink={ hideSummaryLink }
		/>
	);
};

export default StatsModuleUTM;
