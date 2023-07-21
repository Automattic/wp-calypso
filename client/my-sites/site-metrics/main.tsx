import { useSelector } from 'react-redux';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import UplotChartMetrics from './metrics-chart';

export function SiteMetrics() {
	const siteId = useSelector( getSelectedSiteId );
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
			<UplotChartMetrics data={ dataX }></UplotChartMetrics>
		</>
	);
}
