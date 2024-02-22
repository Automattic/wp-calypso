import { useEffect } from 'react';
import { useDispatch, useSelector } from 'calypso/state';
import { requestMetrics } from 'calypso/state/stats/utm-metrics/actions';
import { getMetrics, isLoading } from 'calypso/state/stats/utm-metrics/selectors';
import StatsModuleDataQuery from '../stats-module/stats-module-data-query';
import statsStrings from '../stats-strings';

const StatsModuleUTM = ( { siteId, period, postId, query, summary } ) => {
	const dispatch = useDispatch();
	const moduleStrings = statsStrings();

	useEffect( () => {
		// Fetch UTM metrics with selected UTM parameters.
		dispatch( requestMetrics( siteId, 'utm_source,utm_medium' ) );
	}, [ dispatch, siteId ] );

	const hideSummaryLink = postId !== undefined || summary === true;

	const isFetchingMetrics = useSelector( ( state ) => isLoading( state, siteId ) );
	const metrics = useSelector( ( state ) => getMetrics( state, siteId ) );

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
