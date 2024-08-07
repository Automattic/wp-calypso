import LineChart from 'calypso/components/line-chart';

const data = [
	[
		{ date: 1528462681168, value: 21 },
		{ date: 1528549081168, value: 18 },
		{ date: 1528635481168, value: 37 },
		{ date: 1528721881168, value: 38 },
		{ date: 1528808281168, value: 43 },
		{ date: 1528894681168, value: 44 },
		{ date: 1528981081168, value: 17 },
		{ date: 1529067481168, value: 27 },
		{ date: 1529153881168, value: 26 },
		{ date: 1529240281168, value: 24 },
	],
	[
		{ date: 1528462681168, value: 25 },
		{ date: 1528549081168, value: 37 },
		{ date: 1528635481168, value: 23 },
		{ date: 1528721881168, value: 34 },
		{ date: 1528808281168, value: 3 },
		{ date: 1528894681168, value: 4 },
		{ date: 1528981081168, value: 1 },
		{ date: 1529067481168, value: 9 },
		{ date: 1529153881168, value: 20 },
		{ date: 1529240281168, value: 16 },
	],
	[
		{ date: 1528462681168, value: 7 },
		{ date: 1528549081168, value: 1 },
		{ date: 1528635481168, value: 32 },
		{ date: 1528721881168, value: 40 },
		{ date: 1528808281168, value: 38 },
		{ date: 1528894681168, value: 31 },
		{ date: 1528981081168, value: 17 },
		{ date: 1529067481168, value: 48 },
		{ date: 1529153881168, value: 21 },
		{ date: 1529240281168, value: 46 },
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
