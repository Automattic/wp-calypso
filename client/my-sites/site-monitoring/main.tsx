import moment from 'moment';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import UplotChartMetrics from './metrics-chart';
import { useSiteMetricsQuery } from './use-metrics-query';

export function useSiteMetricsData() {
	const siteId = useSelector( getSelectedSiteId );
	const startTime = moment().subtract( 24, 'hours' ).unix();
	const endTime = moment().unix();

	const { data } = useSiteMetricsQuery( siteId, {
		start: startTime,
		end: endTime,
		metric: 'requests_persec',
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

	// State to hold the formatted data
	const [ formattedData, setFormattedData ] = useState< [ number[], unknown[] ] >( [ [], [] ] );

	useEffect( () => {
		// Update the formattedData state when data changes
		if ( data ) {
			const newData = data.data.periods.reduce(
				( acc, period ) => {
					acc[ 0 ].push( period.timestamp );
					acc[ 1 ].push( getDimensionValue( period ) );
					return acc;
				},
				[ [], [] ] as [ number[], unknown[] ] // Define the correct initial value type
			);
			setFormattedData( newData );
		}
	}, [ data ] );

	return {
		formattedData,
	};
}

export function SiteMetrics() {
	const { formattedData } = useSiteMetricsData();
	return (
		<>
			<h2>Atomic site</h2>
			<UplotChartMetrics data={ formattedData }></UplotChartMetrics>
		</>
	);
}
