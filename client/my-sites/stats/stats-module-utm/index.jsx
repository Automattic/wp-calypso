import useUtmMetricsQuery from '../hooks/use-utm-metrics-query';
import StatsModuleDataQuery from '../stats-module/stats-module-data-query';
import statsStrings from '../stats-strings';

const StatsModuleUTM = ( { siteId, period, postId, query, summary } ) => {
	const moduleStrings = statsStrings();

	// Fetch UTM metrics with switched UTM parameters.
	const { isFetchingMetrics, metrics } = useUtmMetricsQuery( siteId, 'utm_source,utm_medium' );

	const hideSummaryLink = postId !== undefined || summary === true;

	return (
		<StatsModuleDataQuery
			data={ metrics }
			path="utm"
			statType="statsUTM"
			className="stats-module-utm"
			moduleStrings={ moduleStrings.utm }
			period={ period }
			query={ query }
			isLoading={ isFetchingMetrics ?? true }
			hideSummaryLink={ hideSummaryLink }
		/>
	);
};

export default StatsModuleUTM;
