import { useI18n } from '@wordpress/react-i18n';
import { useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import { SiteMonitoringBarChart } from './components/site-monitoring-bar-chart';
import { useMetricsBarChartData } from './components/site-monitoring-bar-chart/use-metrics-bar-chart-data';
import { SiteMonitoringLineChart } from './components/site-monitoring-line-chart';
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

	const { data: requestsData } = useSiteMetricsQuery( siteId, {
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
					acc[ 1 ].push( getDimensionValue( period ) ); // Blue line data

					// Add response time data as a green line
					if ( responseTimeData?.data?.periods && responseTimeData.data.periods[ index ] ) {
						acc[ 2 ].push( getDimensionValue( responseTimeData.data.periods[ index ] ) );
					}
				}

				return acc;
			},
			[ [], [], [] ] as Array< Array< number | null > > // Adjust the initial value with placeholders for both lines
		) || ( [ [], [], [] ] as Array< Array< number | null > > ); // Return default value when data is not available yet

	return {
		formattedData,
	};
}

export function useSiteMetricsData400vs500(
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

	const formattedDataHTTP = data?.data?.periods?.reduce(
		( acc, period ) => {
			const timestamp = period.timestamp;

			// Check if the timestamp is already in the arrays, if not, push it
			if ( acc[ 0 ][ acc[ 0 ].length - 1 ] !== timestamp ) {
				acc[ 0 ].push( timestamp );

				// Check if the dimension object contains values for 400 and 500 status codes
				if ( period.dimension && ( period.dimension[ '400' ] || period.dimension[ '500' ] ) ) {
					// Push values for 400 and 500 status codes into separate arrays
					acc[ 1 ].push( period.dimension[ '400' ] || 0 ); // Array for 400 status code, use 0 as default
					acc[ 2 ].push( period.dimension[ '500' ] || 0 ); // Array for 500 status code, use 0 as default
				} else {
					acc[ 1 ].push( 0 );
					acc[ 2 ].push( 0 );
				}
			}

			return acc;
		},
		[ [], [], [] ] as Array< Array< number > > // Remove null type since we're using 0 as default
	) || [ [], [], [] ]; // Return default value when data is not available yet

	return {
		formattedDataHTTP,
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

export const MetricsTab = () => {
	const { __ } = useI18n();
	const timeRange = useTimeRange();
	const { handleTimeRangeChange } = timeRange;
	const { formattedData } = useSiteMetricsData( timeRange );
	const { formattedDataHTTP } = useSiteMetricsData400vs500( timeRange );
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
	return (
		<div className="site-monitoring-metrics-tab">
			<TimeDateChartControls onTimeRangeChange={ handleTimeRangeChange }></TimeDateChartControls>
			<SiteMonitoringLineChart
				title={ __( 'Requests per minute & average response time' ) }
				data={ formattedData as uPlot.AlignedData }
				lines={ [
					{
						fill: 'rgba(6, 117, 196, 0.1)',
						label: __( 'Requests per minute' ),
						stroke: '#0675C4',
					},
					{
						fill: 'rgba(0, 135, 99, 0.2)',
						label: __( 'Average response time' ),
						stroke: '#008763',
					},
				] }
			></SiteMonitoringLineChart>
			<div className="site-monitoring__pie-charts">
				<SiteMonitoringPieChart
					title="Cache hit/miss"
					className="site-monitoring-cache-pie-chart"
					data={ getFormattedDataForPieChart( cacheHitMissFormattedData, {
						0: 'Cache miss',
						1: 'Cache hit',
					} ) }
				></SiteMonitoringPieChart>
				<SiteMonitoringPieChart
					title="PHP vs. static content served"
					className="site-monitoring-php-static-pie-chart"
					data={ getFormattedDataForPieChart( phpVsStaticFormattedData, {
						php: 'PHP',
						static: 'Static',
					} ) }
				></SiteMonitoringPieChart>
			</div>
			<SiteMonitoringBarChart
				title={ __( 'Requests by HTTP Response Code' ) }
				{ ...statusCodeRequestsProps }
			/>
			<SiteMonitoringLineChart
				title={ __( '400 vs 500 HTTP Responses' ) }
				data={ formattedDataHTTP as uPlot.AlignedData }
				lines={ [
					{
						fill: 'rgba(242, 215, 107, 0.1)',
						label: __( 'HTTP 400: Bad Request' ),
						stroke: 'rgba(242, 215, 107, 1)',
					},
					{
						fill: 'rgba(235, 101, 148, 0.1)',
						label: __( 'HTTP 500: Internal server error' ),
						stroke: 'rgba(235, 101, 148, 1)',
					},
				] }
			></SiteMonitoringLineChart>
		</div>
	);
};
