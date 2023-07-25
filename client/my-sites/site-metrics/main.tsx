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
	const getDimensionValue = ( period ) => {
		if ( period && Array.isArray( period.dimension ) ) {
			// If the dimension is an array, return 0
			return 0;
		} else if ( period && period.dimension && typeof period.dimension === 'object' ) {
			// If the dimension is an object, try to find and return the dimension value
			const firstKey = Object.keys( period.dimension )[ 0 ];
			return firstKey ? period.dimension[ firstKey ] : null;
		}

		return null;
	};

	// Extract timestamps and dimension-values using the reduce method
	const formattedData = data
		? data.data.periods.reduce(
				( acc, period ) => {
					acc[ 0 ].push( period.timestamp );
					acc[ 1 ].push( getDimensionValue( period ) );
					return acc;
				},
				[ [], [] ]
		  )
		: [ [], [] ];

	return {
		formattedData,
		loading: ! data,
	};
}

export function SiteMetrics() {
	const siteId = useSelector( getSelectedSiteId );
	const { formattedData } = SiteMetricsData();
	const dataX = [
		[
			// x-values, unix milliseconds
			1598918400, 1601510400, 1604188800, 1606780800, 1609459200, 1612137600, 1614556800,
			1617235200, 1619827200, 1622505600, 1625097600, 1627776000, 1630454400, 1633046400,
			1635724800, 1638316800, 1640995200, 1643673600, 1646092800, 1648771200, 1651363200,
			1654041600, 1656633600, 1659312000, 1661990400, 1664582400, 1667260800, 1669852800,
			1672531200, 1675209600, 1677628800,
		],
		[
			// y-values
			63385, 62957, 62927, 61934, 61682, 61448, 61193, 60511, 59795, 59469, 58512, 58468, 58404,
			57530, 57444, 57468, 57279, 57363, 56622, 55764, 55208, 55088, 55097, 54243, 53853, 53527,
			53541, 52782, 52662, 51881, 51131,
		],
	];
	return (
		<>
			<h2>Metrics for { siteId }</h2>
			<UplotChartMetrics data={ formattedData }></UplotChartMetrics>
		</>
	);
}
