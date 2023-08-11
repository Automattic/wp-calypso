import { useI18n } from '@wordpress/react-i18n';
import { useTranslate } from 'i18n-calypso';
import { useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import { SiteMonitoringBarChart } from './components/site-monitoring-bar-chart';
import { useMetricsBarChartData } from './components/site-monitoring-bar-chart/use-metrics-bar-chart-data';
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
	labels: Record< string, string >
) {
	return Object.keys( data ).map( ( key ) => {
		const name = labels[ key ] || key;
		return {
			name,
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
			label: __( 'HTTP 200: OK Response' ),
			stroke: 'rgba(104, 179, 232, 1)',
		},
		{
			statusCode: 301,
			fill: 'rgba(227, 174, 212, 0.1)',
			label: __( 'HTTP 301: Moved Permanently' ),
			stroke: 'rgba(227, 174, 212, 1)',
		},
		{
			statusCode: 302,
			fill: 'rgba(9, 181, 133, 0.1)',
			label: __( 'HTTP 302: Moved Temporarily' ),
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
			label: __( 'HTTP 400: Bad Request' ),
			stroke: 'rgba(242, 215, 107, 1)',
		},
		{
			statusCode: 401,
			fill: 'rgba(227, 174, 212, 0.1)',
			label: __( 'HTTP 401: Unauthorized Request' ),
			stroke: 'rgba(227, 174, 212, 1)',
		},
		{
			statusCode: 404,
			fill: 'rgba(9, 181, 133, 0.1)',
			label: __( 'HTTP 404: Not Found Request' ),
			stroke: 'rgba(9, 181, 133, 1)',
		},
		{
			statusCode: 500,
			fill: 'rgba(235, 101, 148, 0.1)',
			label: __( 'HTTP 500: Internal server error' ),
			stroke: 'rgba(235, 101, 148, 1)',
		},
	];
	const statusCodes = series.map( ( { statusCode } ) => statusCode );
	return { series, statusCodes };
};

export const MetricsTab = () => {
	const { __ } = useI18n();
	const translate = useTranslate();
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
	const statusCodeRequestsProps = useMetricsBarChartData( {
		siteId: useSelector( getSelectedSiteId ),
		timeRange,
	} );
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

	return (
		<div className="site-monitoring-metrics-tab">
			<TimeDateChartControls onTimeRangeChange={ handleTimeRangeChange }></TimeDateChartControls>
			<SiteMonitoringLineChart
				title={ __( 'Requests per minute & average response time' ) }
				tooltip={ translate(
					'{{strong}}Requests per minute:{{/strong}} a line representing the number of requests received every minute.{{br/}}{{br/}}{{strong}}Average Response Time{{/strong}}: a line that indicates the average time taken to respond to a request within that minute.',
					{
						components: {
							br: <br />,
							strong: <strong />,
						},
					}
				) }
				data={ formattedData as uPlot.AlignedData }
				series={ [
					{
						fill: 'rgba(6, 117, 196, 0.1)',
						label: __( 'Requests per minute' ),
						stroke: '#0675C4',
					},
					{
						fill: 'rgba(0, 135, 99, 0.2)',
						label: __( 'Average response time(ms)' ),
						stroke: '#008763',
					},
				] }
				isLoading={ isLoadingLineChart }
			></SiteMonitoringLineChart>
			<div className="site-monitoring__pie-charts">
				<SiteMonitoringPieChart
					title={ __( 'Cache hit/miss' ) }
					tooltip={ __(
						'Percentage of cache hits versus cache misses. A hit occurs when the requested data can be found in the cache, reducing the need to obtain it from the original source.'
					) }
					className="site-monitoring-cache-pie-chart"
					data={ getFormattedDataForPieChart( cacheHitMissFormattedData, {
						0: 'Cache miss',
						1: 'Cache hit',
					} ) }
				></SiteMonitoringPieChart>
				<SiteMonitoringPieChart
					title={ __( 'PHP vs. static content served' ) }
					tooltip={ __(
						'Percentages showing the ratio of dynamic versus static content. Dynamic content is the content generated using database information.'
					) }
					className="site-monitoring-php-static-pie-chart"
					data={ getFormattedDataForPieChart( phpVsStaticFormattedData, {
						php: 'PHP',
						static: 'Static',
					} ) }
				></SiteMonitoringPieChart>
			</div>
			<SiteMonitoringBarChart
				title={ __( 'Requests by HTTP response code' ) }
				tooltip={ __(
					'Number of requests categorized by their HTTP response code. Hover over each entry in the legend for detailed information.'
				) }
				{ ...statusCodeRequestsProps }
			/>
			<SiteMonitoringLineChart
				title={ __( 'Success HTTP Responses' ) }
				data={ dataForSuccessCodesChart as uPlot.AlignedData }
				tooltip={ __(
					'Number of client-side errors (400) and server-side errors (500) over time.'
				) }
				series={ successHttpCodes.series }
			></SiteMonitoringLineChart>
			<SiteMonitoringLineChart
				title={ __( 'Error HTTP Responses' ) }
				data={ dataForErrorCodesChart as uPlot.AlignedData }
				tooltip={ __(
					'Number of client-side errors (400) and server-side errors (500) over time.'
				) }
				series={ errorHttpCodes.series }
			></SiteMonitoringLineChart>
		</div>
	);
};
