import { getLocaleSlug } from 'i18n-calypso';
import { useMemo } from 'react';
import { TimeRange } from '../../metrics-tab';
import { PeriodData, useSiteMetricsQuery } from '../../use-metrics-query';

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
function useGroupByTime( periods: PeriodData[], secondsWindow: number ) {
	return useMemo( () => {
		const groupedData: { [ key: number ]: { [ statusCode: string ]: number } } = {};

		periods.forEach( ( period ) => {
			const groupTimestamp = period.timestamp - ( period.timestamp % secondsWindow );
			if ( ! groupedData[ groupTimestamp ] ) {
				groupedData[ groupTimestamp ] = {};
			}
			// Count status codes
			const statusCodes = Object.keys( period.dimension );
			statusCodes.forEach( ( statusCode ) => {
				if ( ! groupedData[ groupTimestamp ][ statusCode ] ) {
					groupedData[ groupTimestamp ][ statusCode ] = 0;
				}
				groupedData[ groupTimestamp ][ statusCode ]++;
			} );
		} );

		const dataForBarChart = [];
		for ( const statusCode of STATUS_CODES ) {
			dataForBarChart.push(
				Object.values( groupedData ).map( ( group ) => group[ statusCode ] || 0 )
			);
		}
		const labels = Object.keys( groupedData ) as unknown as number[];
		return { groupedData, dataForBarChart, labels };
	}, [ periods, secondsWindow ] );
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
	const metric = 'requests_persec';
	const dimension = 'http_status';
	const { data } = useSiteMetricsQuery( siteId, {
		start,
		end,
		metric,
		dimension,
	} );

	const secondsWindow = useSecondsWindow( timeRange );
	const { dataForBarChart, labels } = useGroupByTime( data?.data?.periods || [], secondsWindow );

	return {
		data: [ STATUS_CODES.map( ( code ) => `HTTP ${ code }` ), ...dataForBarChart ] as [
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
