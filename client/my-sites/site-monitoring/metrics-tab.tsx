import { useI18n } from '@wordpress/react-i18n';
import { useTranslate } from 'i18n-calypso';
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

	const { data } = useSiteMetricsQuery( siteId, {
		start,
		end,
		metric: metric || 'requests_persec',
	} );
	// Function to get the dimension value for a specific key and period
	const getDimensionValue = ( period: PeriodData ) => {
		if ( Array.isArray( period?.dimension ) ) {
			// If the dimension is an array, return 0
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
		data?.data?.periods?.reduce(
			( acc, period ) => {
				acc[ 0 ].push( period.timestamp );
				acc[ 1 ].push( getDimensionValue( period ) );
				return acc;
			},
			[ [], [] ] as Array< Array< number | null > > // Define the correct initial value type
		) || ( [ [], [] ] as Array< Array< number | null > > ); // Return a default value when data is not available yet

	return {
		formattedData,
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
	const translate = useTranslate();
	const timeRange = useTimeRange();
	const { handleTimeRangeChange } = timeRange;
	const { formattedData } = useSiteMetricsData( timeRange );
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
		</div>
	);
};
