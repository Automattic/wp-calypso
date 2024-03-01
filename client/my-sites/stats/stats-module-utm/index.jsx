import classNames from 'classnames';
import useUTMMetricTopPostsQuery from '../hooks/use-utm-metric-top-posts-query';
import useUTMMetricsQuery from '../hooks/use-utm-metrics-query';
import StatsModuleDataQuery from '../stats-module/stats-module-data-query';
import statsStrings from '../stats-strings';

const StatsModuleUTM = ( { siteId, period, postId, query, summary, className } ) => {
	const moduleStrings = statsStrings();

	// Fetch UTM metrics with switched UTM parameters.
	const { isFetching: isFetching, metrics } = useUTMMetricsQuery(
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

		if ( ! children.length ) {
			return metric;
		}

		return {
			...metric,
			children,
		};
	} );

	// Hide the module if the specific post is the Home page.
	if ( postId === 0 ) {
		return null;
	}

	const hideSummaryLink = postId !== undefined || summary === true;

	return (
		<StatsModuleDataQuery
			data={ data }
			path="utm"
			className={ classNames( className, 'stats-module-utm' ) }
			moduleStrings={ moduleStrings.utm }
			period={ period }
			query={ query }
			isLoading={ isFetching ?? true }
			hideSummaryLink={ hideSummaryLink }
		/>
	);
};

export default StatsModuleUTM;
