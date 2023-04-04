import UplotLineChart from '@automattic/components/src/chart-uplot';
import { useEffect, useState } from 'react';
import useSubscribersQuery from 'calypso/my-sites/stats/hooks/use-subscribers-query';
import StatsModulePlaceholder from '../stats-module/placeholder';
import type uPlot from 'uplot';

import './style.scss';

// New Subscriber Stats
function transformData(
	data: {
		period: string;
		subscribers: number;
		subscribers_change: number;
	}[]
): uPlot.AlignedData {
	// Transform the data into the format required by uPlot.
	//
	// Note that the incoming data is ordered ascending (newest to oldest)
	// but uPlot expects descending in its deafult configuration.
	const x: number[] = data.map( ( point ) => Number( new Date( point.period ) ) / 1000 ).reverse();
	const y: number[] = data.map( ( point ) => Number( point.subscribers ) ).reverse();

	return [ x, y ];
}

export default function SubscribersSection( { siteId }: { siteId: string } ) {
	const period = 'month';
	const quantity = 30;
	const { isLoading, isError, data, error, status } = useSubscribersQuery(
		siteId,
		period,
		quantity
	);
	const [ errorMessage, setErrorMessage ] = useState( '' );

	useEffect( () => {
		if ( isError && error ) {
			setErrorMessage( error.toString() ); //TODO: check if error had `message` property
		}
	}, [ status, error, isError ] );

	const chartData = transformData( data?.data || [] );

	return (
		<div className="subscribers-section">
			<h1 className="highlight-cards-heading">Subscribers</h1>
			{ isLoading && <StatsModulePlaceholder className="is-chart" isLoading /> }
			{ ! isLoading && chartData.length === 0 && (
				<p className="subscribers-section__no-data">No data availble for the specified period.</p>
			) }
			{ errorMessage && <div>Error: { errorMessage }</div> }
			{ ! isLoading && chartData.length !== 0 && (
				<UplotLineChart data={ chartData } options={ { legend: { show: false } } } />
			) }
		</div>
	);
}
