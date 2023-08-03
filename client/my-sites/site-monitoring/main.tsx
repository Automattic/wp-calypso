import { useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import { calculateTimeRange, TimeDateChartControls } from './date-time-charts-picker';
import UplotChartMetrics from './metrics-chart';
import { MetricsType, useSiteMetricsQuery } from './use-metrics-query';

export function useSiteMetricsData( metric?: MetricsType ) {
	const siteId = useSelector( getSelectedSiteId );

	// State to store the selected time range
	const [ selectedTimeRange, setSelectedTimeRange ] = useState( null );

	// Function to handle the time range selection
	const handleTimeRangeChange = ( timeRange ) => {
		setSelectedTimeRange( timeRange );
	};

	// Call the `calculateTimeRange` function with the default selected option '1' (24 hours)
	const defaultTimeRange = calculateTimeRange( '1' );

	// Calculate the startTime and endTime using useMemo to memoize the result
	const { start, end } = useMemo( () => {
		return selectedTimeRange || defaultTimeRange;
	}, [ defaultTimeRange, selectedTimeRange ] );

	const { data } = useSiteMetricsQuery( siteId, {
		start,
		end,
		metric: metric || 'requests_persec',
	} );

	// Function to get the dimension value for a specific key and period
	const getDimensionValue = ( period: { timestamp?: number; dimension?: any } ) => {
		if ( period && Array.isArray( period?.dimension ) ) {
			// If the dimension is an array, return 0
			return 0;
		} else if ( period && period.dimension && typeof period?.dimension === 'object' ) {
			// If the dimension is an object, try to find and return the dimension value
			const firstKey = Object.keys( period.dimension )[ 0 ];
			return firstKey ? period.dimension[ firstKey ] : null;
		}

		return null;
	};

	// Process the data and set the formattedData state without using useMemo
	const formattedData =
		data?.data?.periods?.reduce(
			( acc, period ) => {
				acc[ 0 ].push( period.timestamp );
				acc[ 1 ].push( getDimensionValue( period ) );
				return acc;
			},
			[ [], [] ] as [ number[], unknown[] ] // Define the correct initial value type
		) || ( [ [], [] ] as [ number[], unknown[] ] ); // Return a default value when data is not available yet

	return {
		formattedData,
		handleTimeRangeChange,
	};
}
export function SiteMetrics() {
	const { formattedData, handleTimeRangeChange } = useSiteMetricsData();

	return (
		<>
			<h2>Atomic site</h2>
			<TimeDateChartControls onTimeRangeChange={ handleTimeRangeChange }></TimeDateChartControls>
			<UplotChartMetrics data={ formattedData as uPlot.AlignedData }></UplotChartMetrics>
		</>
	);
}
