/* eslint-disable @typescript-eslint/no-explicit-any */

import { useRef } from 'react';
import UplotChart from '../';
import UplotBarChart from '../bar';

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

// Bar chart

const barChartData: [ string[], ...number[][] ] = [
	[ 'HTTP 200', 'HTTP 401', 'HTTP 400', 'HTTP 404', 'HTTP 500' ],
	[ 2000, 1000, 800, 1400, 1200, 2100, 1800 ], // 200
	[ 0, 0, 0, 0, 0, 0, 0 ], // 401
	[ 0, 0, 0, 0, 0, 0, 0 ], // 400
	[ 138, 112, 98, 84, 70, 56, 42 ], // 404
	[ 0, 0, 0, 0, 70, 0, 0 ], // 500
];

const barChartLabels = [ '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00' ];
const legendData = [
	{
		fillColor: '#68B3E8',
		tooltip: <span>Tooltip content for HTTP 200</span>,
	},
	{
		fillColor: '#A7AAAD',
		tooltip: <span>Tooltip content for HTTP 401</span>,
	},
	{
		fillColor: '#F2D76B',
		tooltip: <span>Tooltip content for HTTP 400</span>,
	},
	{
		fillColor: '#09B585',
		tooltip: <span>Tooltip content for HTTP 404</span>,
	},
	{
		fillColor: '#F283AA',
		tooltip: <span>Tooltip content for HTTP 500</span>,
	},
];

export const BarChartUplot = () => {
	return (
		<UplotBarChart data={ barChartData } labels={ barChartLabels } legendData={ legendData } />
	);
};
