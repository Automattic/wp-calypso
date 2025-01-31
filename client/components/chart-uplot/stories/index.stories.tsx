/* eslint-disable @typescript-eslint/no-explicit-any */

import { useRef } from 'react';
import UplotChart from '../';

export default { title: 'client/components/Chart (uPlot)' };

// Line chart

const SAMPLE_DATA = [
	[
		// x-values, unix milliseconds
		1598918400, 1601510400, 1604188800, 1606780800, 1609459200, 1612137600, 1614556800, 1617235200,
		1619827200, 1622505600, 1625097600, 1627776000, 1630454400, 1633046400, 1635724800, 1638316800,
		1640995200, 1643673600, 1646092800, 1648771200, 1651363200, 1654041600, 1656633600, 1659312000,
		1661990400, 1664582400, 1667260800, 1669852800, 1672531200, 1675209600, 1677628800,
	],
	[
		// y-values
		63385, 62957, 62927, 61934, 61682, 61448, 61193, 60511, 59795, 59469, 58512, 58468, 58404,
		57530, 57444, 57468, 57279, 57363, 56622, 55764, 55208, 55088, 55097, 54243, 53853, 53527,
		53541, 52782, 52662, 51881, 51131,
	],
];

const Variant = ( props: any ) => <UplotChart data={ SAMPLE_DATA } { ...props } />;

export const Default = () => <Variant />;

export const ExternalLegendMount = () => {
	const legendRef = useRef( null );
	const flexStyle = { display: 'flex', justifyContent: 'space-between', alignContent: 'center' };

	return (
		<>
			<div className="header" style={ flexStyle }>
				<h1>Some Header</h1>
				<div className="legend" ref={ legendRef } style={ flexStyle } />
			</div>
			<Variant legendContainer={ legendRef } />
		</>
	);
};
