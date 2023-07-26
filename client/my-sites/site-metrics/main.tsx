import { useSelector } from 'react-redux';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import UplotChartMetrics from './metrics-chart';
import { useSiteMetricsQuery } from './use-metrics-query';

export function SiteMetricsData() {
	const siteId = useSelector( getSelectedSiteId );
	const startTime = 1689078027;
	const endTime = 1689682827;

	const { data } = useSiteMetricsQuery( siteId, {
		start: startTime,
		end: endTime,
		metric: 'requests_persec',
	} );

	// Function to get the dimension value for a specific key and period
	const getDimensionValue = ( period: { timestamp?: number; dimension: any } ) => {
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

	// Extract timestamps and dimension-values using the reduce method
	const formattedData: [ number[], unknown[] ] = data
		? data.data.periods.reduce(
				( acc: [ number[], unknown[] ], period ) => {
					acc[ 0 ].push( period.timestamp );
					acc[ 1 ].push( getDimensionValue( period ) );
					return acc;
				},
				[ [], [] ]
		  )
		: [ [], [] ];

	return {
		formattedData,
	};
}

export function SiteMetrics() {
	const siteId = useSelector( getSelectedSiteId );
	const { formattedData } = SiteMetricsData();
	return (
		<>
			<h2>Metrics for { siteId }</h2>
			<UplotChartMetrics data={ formattedData }></UplotChartMetrics>
		</>
	);
}
