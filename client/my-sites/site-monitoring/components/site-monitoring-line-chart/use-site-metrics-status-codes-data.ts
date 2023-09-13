import { useSelector } from 'react-redux';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import { useGroupByTime } from '../../hooks/use-group-by-time';
import { TimeRange } from '../../metrics-tab';
import { DimensionParams, MetricsType, useSiteMetricsQuery } from '../../use-metrics-query';

export function useSiteMetricsStatusCodesData(
	timeRange: TimeRange,
	statusCodes: number[],
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

	const { dataGroupedByTime, labels } = useGroupByTime( data?.data, statusCodes );

	return {
		data: [ labels, ...dataGroupedByTime ],
	};
}
