import LineChart from 'calypso/components/line-chart';
import StatsEmptyState from '../stats-empty-state';
import './style.scss';

// New Subscriber Stats
// We don't have any data yet so we are just plotting visitor data.
// Currently using the LineChart component from the Calypso library.

const DATA_TYPE_API = 'api';
const DATA_TYPE_SINGLE = 'single';
const DATA_TYPE_MULTI = 'multi';

function getDataSingleLine() {
	const data = [
		[
			{ date: 1528462681168, value: 21 },
			{ date: 1528549081168, value: 26 },
			{ date: 1528635481168, value: 32 },
			{ date: 1528721881168, value: 38 },
			{ date: 1528808281168, value: 43 },
			{ date: 1528894681168, value: 44 },
			{ date: 1528981081168, value: 57 },
			{ date: 1529067481168, value: 54 },
			{ date: 1529153881168, value: 49 },
			{ date: 1529240281168, value: 61 },
		],
	];
	return data;
}

function getDataMultiLine() {
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
	return data;
}

function getDataAPISample() {
	// From https://code.a8c.com/D105106 -- Work in progress on new endpoint.
	const data = [
		[ '2023-03-01', 51131, 547 ],
		[ '2023-02-01', 51881, 750 ],
		[ '2023-01-01', 52662, 781 ],
		[ '2022-12-01', 52782, 120 ],
		[ '2022-11-01', 53541, 759 ],
		[ '2022-10-01', 53527, -14 ],
		[ '2022-09-01', 53853, 326 ],
		[ '2022-08-01', 54243, 390 ],
		[ '2022-07-01', 55097, 854 ],
		[ '2022-06-01', 55088, -9 ],
		[ '2022-05-01', 55208, 120 ],
		[ '2022-04-01', 55764, 556 ],
		[ '2022-03-01', 56622, 858 ],
		[ '2022-02-01', 57363, 741 ],
		[ '2022-01-01', 57279, -84 ],
		[ '2021-12-01', 57468, 189 ],
		[ '2021-11-01', 57444, -24 ],
		[ '2021-10-01', 57530, 86 ],
		[ '2021-09-01', 58404, 874 ],
		[ '2021-08-01', 58468, 64 ],
		[ '2021-07-01', 58512, 44 ],
		[ '2021-06-01', 59469, 957 ],
		[ '2021-05-01', 59795, 326 ],
		[ '2021-04-01', 60511, 716 ],
		[ '2021-03-01', 61193, 682 ],
		[ '2021-02-01', 61448, 255 ],
		[ '2021-01-01', 61682, 234 ],
		[ '2020-12-01', 61934, 252 ],
		[ '2020-11-01', 62927, 993 ],
		[ '2020-10-01', 62957, 30 ],
		[ '2020-09-01', 63385, 428 ],
	];
	// Map the data.
	// 1. Note that the data is ordered from newest to oldest.
	// 2. We need to reverse the array or the LineChart component emits errors.
	// 3. Labeling of the x-axis doesn't work too well if the data series is too big.
	const maxDataSize = 10;
	const processedData = data.map( ( point ) => {
		const [ period, count, diff ] = point;
		return {
			date: new Date( period ).getTime(),
			value: count,
			diff: diff,
		};
	} );
	return [ processedData.slice( 0, maxDataSize ).reverse() ];
}

function getData( type ) {
	if ( type === DATA_TYPE_API ) {
		return getDataAPISample();
	}
	if ( type === DATA_TYPE_SINGLE ) {
		return getDataSingleLine();
	}
	if ( type === DATA_TYPE_MULTI ) {
		return getDataMultiLine();
	}
	return [];
}

export default function SubscribersSection() {
	const dataType = DATA_TYPE_API;
	const data = getData( dataType );

	const tooltipHelper =
		dataType !== DATA_TYPE_API ? ( datum ) => datum.value : ( datum ) => `Changed: ${ datum.diff }`;

	return (
		<div className="subscribers-section">
			<h1 className="highlight-cards-heading">Subscribers</h1>
			<LineChart data={ data } renderTooltipForDatanum={ tooltipHelper }>
				<StatsEmptyState />
			</LineChart>
		</div>
	);
}
