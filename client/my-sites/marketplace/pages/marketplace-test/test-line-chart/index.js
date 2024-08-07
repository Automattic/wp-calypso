import LineChart from 'calypso/components/line-chart';

const data = [
	[
		{ date: 1528462681168, value: 21, pointStyle: 'triangle' },
		{ date: 1528549081168, value: 18, pointStyle: 'triangle' },
		{ date: 1528635481168, value: 37, pointStyle: 'triangle' },
		{ date: 1528721881168, value: 38, pointStyle: 'triangle' },
		{ date: 1528808281168, value: 43, pointStyle: 'triangle' },
		{ date: 1528894681168, value: 44, pointStyle: 'triangle' },
		{ date: 1528981081168, value: 17, pointStyle: 'triangle' },
		{ date: 1529067481168, value: 27, pointStyle: 'triangle' },
		{ date: 1529153881168, value: 26, pointStyle: 'triangle' },
		{ date: 1529240281168, value: 24, pointStyle: 'triangle' },
	],
	[
		{ date: 1528462681168, value: 25, pointStyle: 'circle' },
		{ date: 1528549081168, value: 37, pointStyle: 'circle' },
		{ date: 1528635481168, value: 23, pointStyle: 'circle' },
		{ date: 1528721881168, value: 34, pointStyle: 'circle' },
		{ date: 1528808281168, value: 3, pointStyle: 'circle' },
		{ date: 1528894681168, value: 4, pointStyle: 'circle' },
		{ date: 1528981081168, value: 1, pointStyle: 'circle' },
		{ date: 1529067481168, value: 9, pointStyle: 'circle' },
		{ date: 1529153881168, value: 20, pointStyle: 'circle' },
		{ date: 1529240281168, value: 16, pointStyle: 'circle' },
	],
	[
		{ date: 1528462681168, value: 7, pointStyle: 'square' },
		{ date: 1528549081168, value: 1, pointStyle: 'square' },
		{ date: 1528635481168, value: 32, pointStyle: 'square' },
		{ date: 1528721881168, value: 40, pointStyle: 'square' },
		{ date: 1528808281168, value: 38, pointStyle: 'square' },
		{ date: 1528894681168, value: 31, pointStyle: 'square' },
		{ date: 1528981081168, value: 17, pointStyle: 'square' },
		{ date: 1529067481168, value: 48, pointStyle: 'square' },
		{ date: 1529153881168, value: 21, pointStyle: 'square' },
		{ date: 1529240281168, value: 46, pointStyle: 'square' },
	],
];

export default () => {
	const legendInfo = [ { name: 'Line #1' }, { name: 'Line #2' }, { name: 'Line #3' } ];

	return (
		<div style={ { border: '1px solid gray', padding: '2rem' } }>
			<LineChart data={ data } fillArea={ false } legendInfo={ legendInfo } />
		</div>
	);
};
