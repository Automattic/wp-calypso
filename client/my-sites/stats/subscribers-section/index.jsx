import { useEffect, useState } from 'react';
import LineChart from 'calypso/components/line-chart';
import StatsEmptyState from '../stats-empty-state';
import './style.scss';

// New Subscriber Stats
// We don't have any data yet so we are just using some test data.
// Currently using the LineChart component from the Calypso library.

function getData() {
	// From https://code.a8c.com/D105106 -- Work in progress on new endpoint.
	return [
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
}

function transformData( data ) {
	// Transform the data into the format required by the chart component.
	// 1. Note that the data is ordered from newest to oldest.
	// 2. We need to reverse the array or the LineChart component emits errors.
	// 3. Labeling of the x-axis doesn't work too well if the data series is too big.
	const maxDataSize = 10;
	const trimmedData = data.length > 10 ? data.slice( 0, maxDataSize ) : data;
	const processedData = trimmedData.map( ( point ) => {
		const [ period, count, diff ] = point;
		return {
			date: new Date( period ).getTime(),
			value: count,
			diff: diff,
		};
	} );
	return [ processedData.reverse() ];
}

export default function SubscribersSection() {
	const [ isLoading, setIsLoading ] = useState( true );
	const data = transformData( isLoading ? [] : getData() );

	// Determines what is shown in the tooltip on hover.
	const tooltipHelper = ( datum ) => `Changed: ${ datum.diff }`;

	useEffect( () => {
		setTimeout( () => setIsLoading( false ), 5000 );
	}, [ isLoading ] );

	return (
		<div className="subscribers-section">
			<h1 className="highlight-cards-heading">Subscribers</h1>
			<LineChart data={ data } renderTooltipForDatanum={ tooltipHelper }>
				<StatsEmptyState />
			</LineChart>
		</div>
	);
}
