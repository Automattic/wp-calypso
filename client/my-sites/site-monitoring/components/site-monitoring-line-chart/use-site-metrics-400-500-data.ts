import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import { TimeRange } from '../../metrics-tab';
import {
	DimensionParams,
	MetricsType,
	PeriodData,
	useSiteMetricsQuery,
} from '../../use-metrics-query';

const STATUS_CODES = [ '4xx', '5xx' ];

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

		const dataFor400500Chart = [];
		for ( const statusCode of STATUS_CODES ) {
			dataFor400500Chart.push(
				Object.values( groupedData ).map( ( group ) => group[ statusCode ] || 0 )
			);
		}

		const labels = Object.keys( groupedData ) as unknown as number[];
		return { groupedData, dataFor400500Chart, labels };
	}, [ periods, secondsWindow ] );
}

export function useSiteMetricsData400vs5002(
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

	const { dataFor400500Chart, labels } = useGroupByTime( data?.data?.periods || [], secondsWindow );

	return {
		labels,
		data: [ STATUS_CODES.map( ( code ) => `HTTP ${ code }` ), ...dataFor400500Chart ] as [
			string[],
			...number[][]
		],
	};
}
