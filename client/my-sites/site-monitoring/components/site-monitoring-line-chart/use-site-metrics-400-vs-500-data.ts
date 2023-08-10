import { useSelector } from 'react-redux';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import { useGroupByTime } from '../../hooks/use-group-by-time';
import { TimeRange } from '../../metrics-tab';
import { DimensionParams, MetricsType, useSiteMetricsQuery } from '../../use-metrics-query';

const STATUS_CODES = [ 400, 500 ];

function useSecondsWindow( timeRange: { start: number; end: number } ) {
	const { start, end } = timeRange;
	const hours = ( end - start ) / 60 / 60;

	if ( hours <= 6 ) {
		return 10 * 60; // 10 minutes in seconds
	} else if ( hours === 24 ) {
		return 30 * 60; // 30 minutes in seconds
	}

	return 3600; // 1 hour in seconds
}

export function useSiteMetrics400vs500Data(
	timeRange: TimeRange,
	metric?: MetricsType,
	dimension?: DimensionParams
) {
	const siteId = useSelector( getSelectedSiteId );

	// Use the custom hook for time range selection
	const { start, end } = timeRange;

	const { data } = useSiteMetricsQuery( siteId, {
		start,
		end,
		metric: metric || 'requests_persec',
		dimension: dimension || 'http_status',
	} );

	const secondsWindow = useSecondsWindow( timeRange );

	const { dataGroupedByTime, labels } = useGroupByTime(
		data?.data?.periods || [],
		secondsWindow,
		STATUS_CODES
	);

	return {
		data: [ labels, ...dataGroupedByTime ],
	};
}
