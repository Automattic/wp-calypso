import LineChart from 'calypso/components/line-chart';
import MuLineChart from './muPlot.jsx';

import './style.scss';

const data = [
	[
		{ date: 1528462681168, value: 21, pointStyle: 'square' },
		{ date: 1528549081168, value: 18, pointStyle: 'square' },
		{ date: 1528635481168, value: 37, pointStyle: 'triangle' },
		{ date: 1528721881168, value: 38, pointStyle: 'triangle' },
		{ date: 1528808281168, value: 43, pointStyle: 'circle' },
		{ date: 1528894681168, value: 44, pointStyle: 'circle' },
		{ date: 1528981081168, value: 17, pointStyle: 'square' },
		{ date: 1529067481168, value: 27, pointStyle: 'triangle' },
		{ date: 1529153881168, value: 26, pointStyle: 'triangle' },
		{ date: 1529240281168, value: 24, pointStyle: 'square' },
	],
];

const Box = ( { name, children } ) => {
	return (
		<div className="box">
			<h1>{ name }</h1>
			{ children }
		</div>
	);
};

export default () => {
	const legendInfo = [ { name: 'Line #1' } ];

	return (
		<div className="container">
			<Box name="Calypso Line Chart">
				<LineChart data={ data } fillArea={ false } legendInfo={ legendInfo } />
			</Box>
			<Box name="uPlot Chart">
				<MuLineChart />
			</Box>
			<Box name="ChartJS">
				<h1>hola</h1>
			</Box>
		</div>
	);
};
