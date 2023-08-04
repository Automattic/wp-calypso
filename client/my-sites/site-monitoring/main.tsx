import { useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import { SiteMonitoringPieChart } from './components/site-monitoring-pie-chart';
import { calculateTimeRange, TimeDateChartControls } from './components/time-range-picker';
import UplotChartMetrics from './metrics-chart';
import { MetricsType, DimensionParams, PeriodData, useSiteMetricsQuery } from './use-metrics-query';

import './style.scss';

interface TimeRange {
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

	// Call the `calculateTimeRange` function with the default selected option
	const defaultTimeRange = calculateTimeRange( '24-hours' );

	// Calculate the startTime and endTime using useMemo to memoize the result
	const { start, end } = useMemo( () => {
		return selectedTimeRange || defaultTimeRange;
	}, [ defaultTimeRange, selectedTimeRange ] );

	return {
		start,
		end,
		handleTimeRangeChange,
	};
}

function useSiteMetricsData( metric?: MetricsType ) {
	const siteId = useSelector( getSelectedSiteId );

	// Use the custom hook for time range selection
	const { start, end, handleTimeRangeChange } = useTimeRange();

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
		handleTimeRangeChange,
	};
}

function useAggregateSiteMetricsData( metric?: MetricsType, dimension?: DimensionParams ) {
	const siteId = useSelector( getSelectedSiteId );

	// Use the custom hook for time range selection
	const { start, end, handleTimeRangeChange } = useTimeRange();

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
		handleTimeRangeChange,
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

export function SiteMetrics() {
	const { formattedData, handleTimeRangeChange } = useSiteMetricsData();
	const { formattedData: cacheHitMissFormattedData } = useAggregateSiteMetricsData(
		'requests_persec',
		'page_is_cached'
	);
	const { formattedData: phpVsStaticFormattedData } = useAggregateSiteMetricsData(
		'requests_persec',
		'page_renderer'
	);

	return (
		<div className="site-monitoring">
			<h2>Atomic site</h2>
			<TimeDateChartControls onTimeRangeChange={ handleTimeRangeChange }></TimeDateChartControls>
			<UplotChartMetrics data={ formattedData as uPlot.AlignedData }></UplotChartMetrics>
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
		</div>
	);
}
