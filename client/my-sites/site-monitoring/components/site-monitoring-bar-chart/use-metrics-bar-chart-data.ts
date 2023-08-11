import { getLocaleSlug } from 'i18n-calypso';
import { useGroupByTime } from '../../hooks/use-group-by-time';
import { TimeRange } from '../../metrics-tab';
import { useSiteMetricsQuery } from '../../use-metrics-query';

const STATUS_CODES = [ 200, 401, 400, 404, 500 ];

interface UseMetricsBarChartDataParams {
	siteId: number | null;
	timeRange: TimeRange;
}
function useSecondsWindow( timeRange: TimeRange ) {
	const { start, end } = timeRange;
	const hours = ( end - start ) / 60 / 60;
	if ( hours < 24 ) {
		return 1 * 3600;
	} else if ( hours === 24 ) {
		return 4 * 3600;
	}
	return 24 * 3600;
}

function getLongDate( date: Date, locale: string ): string {
	const formatter = new Intl.DateTimeFormat( locale, {
		day: 'numeric',
		month: 'long',
	} );
	return formatter.format( date );
}

function getShortDate( date: Date, locale: string ): string {
	const formatter = new Intl.DateTimeFormat( locale, {
		hour: '2-digit',
		minute: '2-digit',
		hour12: false,
	} );
	return formatter.format( date );
}

export function useMetricsBarChartData( { siteId, timeRange }: UseMetricsBarChartDataParams ) {
	const { start, end } = timeRange;
	const { data, isLoading } = useSiteMetricsQuery( siteId, {
		start,
		end,
		metric: 'requests_persec',
		dimension: 'http_status',
	} );

	const secondsWindow = useSecondsWindow( timeRange );
	const { dataGroupedByTime, labels } = useGroupByTime(
		data?.data?.periods || [],
		secondsWindow,
		STATUS_CODES
	);

	return {
		isLoading,
		data: [ STATUS_CODES.map( ( code ) => `HTTP ${ code }` ), ...dataGroupedByTime ] as [
			string[],
			...number[][]
		],
		labels: labels.map( ( timeSeconds ) => {
			const date = new Date( timeSeconds * 1000 );
			const locale = getLocaleSlug() || 'en';
			if ( secondsWindow < 24 * 3600 ) {
				return getShortDate( date, locale );
			}
			return getLongDate( date, locale );
		} ),
	};
}
