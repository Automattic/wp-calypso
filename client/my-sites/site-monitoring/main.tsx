import moment from 'moment';
import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import UplotChartMetrics from './metrics-chart';
import { MetricsType, useSiteMetricsQuery } from './use-metrics-query';

export function useSiteMetricsData( start?: number, end?: number, metric?: MetricsType ) {
	const siteId = useSelector( getSelectedSiteId );

	// Calculate the startTime and endTime using useMemo
	const startTime = useMemo( () => start || moment().subtract( 24, 'hours' ).unix(), [ start ] );
	const endTime = useMemo( () => end || moment().unix(), [ end ] );

	const { data } = useSiteMetricsQuery( siteId, {
		start: startTime,
		end: endTime,
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
	};
}
export function SiteMetrics() {
	const { formattedData } = useSiteMetricsData();
	return (
		<>
			<h2>Atomic site</h2>
			<UplotChartMetrics data={ formattedData as uPlot.AlignedData }></UplotChartMetrics>
		</>
	);
}
