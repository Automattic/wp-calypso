import { useI18n } from '@wordpress/react-i18n';
import { useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { useLocalizedMoment } from 'calypso/components/localized-moment';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import { SiteMonitoringLineChart } from './components/site-monitoring-line-chart';
import { useSiteMetricsStatusCodesData } from './components/site-monitoring-line-chart/use-site-metrics-status-codes-data';
import { SiteMonitoringPieChart } from './components/site-monitoring-pie-chart';
import { calculateTimeRange, TimeDateChartControls } from './components/time-range-picker';
import { MetricsType, DimensionParams, PeriodData, useSiteMetricsQuery } from './use-metrics-query';

import './style.scss';

export interface TimeRange {
	start: number;
	end: number;
}

function useTimeRange() {
	// State to store the selected time range
	const [ selectedTimeRange, setSelectedTimeRange ] = useState( null as TimeRange | null );

	// Function to handle the time range selection
	const handleTimeRangeChange = ( timeRange: TimeRange ) => {
		setSelectedTimeRange( timeRange );
	};

	// Calculate the startTime and endTime using useMemo to memoize the result
	const { start, end } = useMemo( () => {
		return selectedTimeRange || calculateTimeRange( '24-hours' );
	}, [ selectedTimeRange ] );

	return {
		start,
		end,
		handleTimeRangeChange,
	};
}

export function useSiteMetricsData( timeRange: TimeRange, metric?: MetricsType ) {
	const siteId = useSelector( getSelectedSiteId );

	// Use the custom hook for time range selection
	const { start, end } = timeRange;

	const { data: requestsData, isLoading } = useSiteMetricsQuery( siteId, {
		start,
		end,
		metric: metric || 'requests_persec',
	} );

	const { data: responseTimeData } = useSiteMetricsQuery( siteId, {
		start,
		end,
		metric: metric || 'response_time_average',
	} );

	// Function to get the dimension value for a specific key and period
	const getDimensionValue = ( period: PeriodData ) => {
		if ( typeof period?.dimension === 'object' && Object.keys( period.dimension ).length === 0 ) {
			// If the dimension is an empty object, return 0
			return 0;
		} else if ( typeof period?.dimension === 'object' ) {
			// If the dimension is an object, try to find and return the dimension value
			const firstKey = Object.keys( period.dimension )[ 0 ];
			return firstKey ? period.dimension[ firstKey ] : null;
		}

		return null;
	};

	// Process the data in the format accepted by uPlot
	const formattedData =
		requestsData?.data?.periods?.reduce(
			( acc, period, index ) => {
				const timestamp = period.timestamp;

				// Check if the timestamp is already in the arrays, if not, push it
				if ( acc[ 0 ][ acc[ 0 ].length - 1 ] !== timestamp ) {
					acc[ 0 ].push( timestamp );

					const requestsPerSecondValue = getDimensionValue( period );
					if ( requestsPerSecondValue !== null ) {
						const requestsPerMinuteValue = requestsPerSecondValue * 60; // Convert to requests per minute
						acc[ 1 ].push( requestsPerMinuteValue ); // Push RPM value into the array
					}
					// Add response time data as a green line
					if ( responseTimeData?.data?.periods && responseTimeData.data.periods[ index ] ) {
						const responseTimeAverageValue = getDimensionValue(
							responseTimeData.data.periods[ index ]
						);
						if ( responseTimeAverageValue !== null ) {
							acc[ 2 ].push( responseTimeAverageValue * 1000 ); // Convert to response time average in milliseconds
						}
					}
				}

				return acc;
			},
			[ [], [], [] ] as Array< Array< number | null > > // Adjust the initial value with placeholders for both lines
		) || ( [ [], [], [] ] as Array< Array< number | null > > ); // Return default value when data is not available yet

	return {
		formattedData,
		isLoading,
	};
}

function useAggregateSiteMetricsData(
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

	const formattedData: Record< string, number > = {};
	data?.data?.periods?.forEach( ( period ) => {
		if ( Array.isArray( period.dimension ) ) {
			return;
		}
		const dimension = period.dimension;
		Object.keys( period.dimension ).forEach( ( key ) => {
			if ( ! formattedData[ key ] ) {
				formattedData[ key ] = 0;
			}
			formattedData[ key ] += dimension[ key ];
		} );
	} );

	return {
		formattedData,
	};
}

function getFormattedDataForPieChart(
	data: Record< string, number >,
	labels: Record<
		string,
		{
			name: string;
			className?: string;
		}
	>
) {
	return Object.keys( data ).map( ( key ) => {
		const name = labels[ key ]?.name || key;
		const className = labels[ key ]?.className || key;
		return {
			name,
			className,
			value: data[ key ],
			description: undefined,
		};
	} );
}

const useSuccessHttpCodeSeries = () => {
	const { __ } = useI18n();
	const series = [
		{
			statusCode: 200,
			fill: 'rgba(104, 179, 232, 0.1)',
			label: __( '200: OK Response' ),
			stroke: 'rgba(104, 179, 232, 1)',
		},
		{
			statusCode: 301,
			fill: 'rgba(227, 174, 212, 0.1)',
			label: __( '301: Moved Permanently' ),
			stroke: 'rgba(227, 174, 212, 1)',
		},
		{
			statusCode: 302,
			fill: 'rgba(9, 181, 133, 0.1)',
			label: __( '302: Moved Temporarily' ),
			stroke: 'rgba(9, 181, 133, 1)',
		},
	];
	const statusCodes = series.map( ( { statusCode } ) => statusCode );
	return { series, statusCodes };
};

const useErrorHttpCodeSeries = () => {
	const { __ } = useI18n();
	const series = [
		{
			statusCode: 400,
			fill: 'rgba(242, 215, 107, 0.1)',
			label: __( '400: Bad Request' ),
			stroke: 'rgba(242, 215, 107, 1)',
		},
		{
			statusCode: 401,
			fill: 'rgba(227, 174, 212, 0.1)',
			label: __( '401: Unauthorized Request' ),
			stroke: 'rgba(227, 174, 212, 1)',
		},
		{
			statusCode: 403,
			fill: 'rgba(104, 179, 232, 0.1)',
			label: __( '403: Forbidden Request' ),
			stroke: 'rgba(104, 179, 232, 1)',
		},
		{
			statusCode: 404,
			fill: 'rgba(9, 181, 133, 0.1)',
			label: __( '404: Not Found Request' ),
			stroke: 'rgba(9, 181, 133, 1)',
		},
		{
			statusCode: 500,
			fill: 'rgba(235, 101, 148, 0.1)',
			label: __( '500: Internal server error' ),
			stroke: 'rgba(235, 101, 148, 1)',
		},
	];
	const statusCodes = series.map( ( { statusCode } ) => statusCode );
	return { series, statusCodes };
};

export const MetricsTab = () => {
	const { __ } = useI18n();
	const moment = useLocalizedMoment();
	const timeRange = useTimeRange();
	const { handleTimeRangeChange } = timeRange;
	const { formattedData, isLoading: isLoadingLineChart } = useSiteMetricsData( timeRange );
	const { formattedData: cacheHitMissFormattedData } = useAggregateSiteMetricsData(
		timeRange,
		'requests_persec',
		'page_is_cached'
	);
	const { formattedData: phpVsStaticFormattedData } = useAggregateSiteMetricsData(
		timeRange,
		'requests_persec',
		'page_renderer'
	);
	const successHttpCodes = useSuccessHttpCodeSeries();
	const { data: dataForSuccessCodesChart } = useSiteMetricsStatusCodesData(
		timeRange,
		successHttpCodes.statusCodes
	);
	const errorHttpCodes = useErrorHttpCodeSeries();
	const { data: dataForErrorCodesChart } = useSiteMetricsStatusCodesData(
		timeRange,
		errorHttpCodes.statusCodes
	);

	const startDate = moment( timeRange.start * 1000 );
	const endDate = moment( timeRange.end * 1000 );
	let dateRange = '';

	if ( endDate.isSame( startDate, 'day' ) ) {
		dateRange = endDate.format( 'LL' );
	} else {
		dateRange = `${ startDate.format( 'LL' ) } - ${ endDate.format( 'LL' ) }`;
	}

	return (
		<div className="site-monitoring-metrics-tab">
			<div className="site-monitoring-time-controls__container">
				<div className="site-monitoring-time-controls__title">{ dateRange }</div>
				<TimeDateChartControls onTimeRangeChange={ handleTimeRangeChange }></TimeDateChartControls>
			</div>
			<SiteMonitoringLineChart
				timeRange={ timeRange }
				title={ __( 'Server performance' ) }
				subtitle={ __( 'Requests per minute and average server response time' ) }
				data={ formattedData as uPlot.AlignedData }
				series={ [
					{
						fill: 'rgba(6, 117, 196, 0.1)',
						label: __( 'Requests per minute' ),
						stroke: '#0675C4',
					},
					{
						fill: 'rgba(0, 135, 99, 0.2)',
						label: __( 'Average response time (ms)' ),
						stroke: '#008763',
						scale: 'average-response-time',
					},
				] }
				isLoading={ isLoadingLineChart }
			></SiteMonitoringLineChart>
			<div className="site-monitoring__pie-charts">
				<SiteMonitoringPieChart
					title={ __( 'Cache efficiency' ) }
					subtitle={ __( 'Percentage of cache hits versus cache misses' ) }
					className="site-monitoring-cache-pie-chart"
					data={ getFormattedDataForPieChart( cacheHitMissFormattedData, {
						1: {
							name: 'Cache hit',
							className: 'cache-hit',
						},
						0: {
							name: 'Cache miss',
							className: 'cache-miss',
						},
					} ) }
					fixedOrder
				></SiteMonitoringPieChart>
				<SiteMonitoringPieChart
					title={ __( 'Response types' ) }
					subtitle={ __( 'Percentage of dynamic PHP responses versus static content responses' ) }
					className="site-monitoring-php-static-pie-chart"
					data={ getFormattedDataForPieChart( phpVsStaticFormattedData, {
						php: {
							name: 'PHP',
							className: 'php',
						},
						static: {
							name: 'Static',
							className: 'static',
						},
					} ) }
					fixedOrder
				></SiteMonitoringPieChart>
			</div>
			<SiteMonitoringLineChart
				timeRange={ timeRange }
				title={ __( 'Successful HTTP responses' ) }
				subtitle={ __( 'Requests completed without errors by the server' ) }
				data={ dataForSuccessCodesChart as uPlot.AlignedData }
				series={ successHttpCodes.series }
			></SiteMonitoringLineChart>
			<SiteMonitoringLineChart
				timeRange={ timeRange }
				title={ __( 'Unsuccessful HTTP responses' ) }
				subtitle={ __( 'Requests that encountered errors or issues during processing' ) }
				data={ dataForErrorCodesChart as uPlot.AlignedData }
				series={ errorHttpCodes.series }
			></SiteMonitoringLineChart>
		</div>
	);
};
