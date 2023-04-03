import { useEffect, useState } from 'react';
import LineChart from 'calypso/components/line-chart';
import useSubscribersQuery from 'calypso/my-sites/stats/hooks/use-subscribers-query';
import StatsEmptyState from '../stats-empty-state';
import StatsModulePlaceholder from '../stats-module/placeholder';

import './style.scss';

// New Subscriber Stats
// We don't have any data yet so we are just using some test data.
// Currently using the LineChart component from the Calypso library.

function transformData( data ) {
	// Transform the data into the format required by the chart component.
	// 1. Note that the data is ordered from newest to oldest.
	// 2. We need to reverse the array or the LineChart component emits errors.
	// 3. Labeling of the x-axis doesn't work too well if the data series is too big.
	const maxDataSize = 10;
	const trimmedData = data.length > 10 ? data.slice( 0, maxDataSize ) : data;
	const processedData = trimmedData.map( ( point ) => {
		const { period, subscribers, subscribers_change } = point;
		return {
			date: new Date( period ).getTime(),
			value: subscribers,
			diff: subscribers_change,
		};
	} );
	return [ processedData.reverse() ];
}

export default function SubscribersSection( { siteId } ) {
	const { isLoading, isError, data, error, status } = useSubscribersQuery( siteId );

	// Determines what is shown in the tooltip on hover.
	const tooltipHelper = ( datum ) => `Changed: ${ datum.diff }`;

	const [ errorMessage, setErrorMessage ] = useState( '' );

	useEffect( () => {
		if ( isError && error ) {
			setErrorMessage( error.message );
		}
	}, [ status, error, isError ] );

	// console.log( data );

	const chartData = transformData( data?.data ) || [];

	return (
		<div className="subscribers-section">
			<h1 className="highlight-cards-heading">Subscribers</h1>
			{ errorMessage && <div>Error: { errorMessage }</div> }
			{ isLoading ? (
				<StatsModulePlaceholder className="is-chart" isLoading />
			) : (
				<LineChart data={ chartData } renderTooltipForDatanum={ tooltipHelper }>
					<StatsEmptyState />
				</LineChart>
			) }
		</div>
	);
}
