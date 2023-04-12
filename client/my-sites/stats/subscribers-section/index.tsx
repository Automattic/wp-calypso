import UplotChart from '@automattic/components/src/chart-uplot';
import { useEffect, useRef, useState } from 'react';
import { UseQueryResult } from 'react-query';
import Intervals from 'calypso/blocks/stats-navigation/intervals';
import useSubscribersQuery from 'calypso/my-sites/stats/hooks/use-subscribers-query';
import DatePicker from '../stats-date-picker';
import StatsModulePlaceholder from '../stats-module/placeholder';
import StatsPeriodHeader from '../stats-period-header';
import StatsPeriodNavigation from '../stats-period-navigation';
import type uPlot from 'uplot';

import './style.scss';

interface SubscribersData {
	period: string;
	subscribers: number;
	subscribers_change: number;
}

interface SubscribersDataResult {
	data: SubscribersData[];
}

// New Subscriber Stats
function transformData( data: SubscribersData[] ): uPlot.AlignedData {
	// Transform the data into the format required by uPlot.
	//
	// Note that the incoming data is ordered ascending (newest to oldest)
	// but uPlot expects descending in its deafult configuration.
	const x: number[] = data.map( ( point ) => Number( new Date( point.period ) ) / 1000 ).reverse();
	const y: number[] = data.map( ( point ) => Number( point.subscribers ) ).reverse();

	return [ x, y ];
}

export default function SubscribersSection( {
	siteId,
	slug,
	period = 'month',
}: {
	siteId: string;
	slug?: string;
	period?: string;
} ) {
	const quantity = 30;
	const {
		isLoading,
		isError,
		data,
		// error,
		status,
	}: UseQueryResult< SubscribersDataResult > = useSubscribersQuery( siteId, period, quantity );
	const [ errorMessage, setErrorMessage ] = useState( '' );
	const legendRef = useRef< HTMLDivElement >( null );

	useEffect( () => {
		if ( isError ) {
			setErrorMessage( 'There was an error!' ); //TODO: check if error has a `message` property and how to handle `error`'s type
		}
	}, [ status, isError ] );

	const chartData = transformData( data?.data || [] );

	const subscribers = {
		label: 'Subscribers',
		path: `/stats/subscribers/`,
	};

	const date = new Date();

	const slugPath = slug ? `/${ slug }` : '';
	const pathTemplate = `${ subscribers.path }{{ interval }}${ slugPath }`;

	return (
		<div className="subscribers-section">
			<div className="subscribers-section-heading">
				<h1 className="highlight-cards-heading">Subscribers</h1>
				{ ! isLoading && (
					<div>
						<StatsPeriodHeader>
							<StatsPeriodNavigation date={ date } period={ period } url={ pathTemplate }>
								<DatePicker
									period={ period }
									date={ date }
									statsType="statsTopPosts"
									showQueryDate
								/>
							</StatsPeriodNavigation>
							<Intervals selected={ period } pathTemplate={ pathTemplate } compact={ true } />
						</StatsPeriodHeader>
					</div>
				) }
				<div className="subscribers-section-legend" ref={ legendRef }></div>
			</div>
			{ isLoading && <StatsModulePlaceholder className="is-chart" isLoading /> }
			{ ! isLoading && chartData.length === 0 && (
				<p className="subscribers-section__no-data">No data available for the specified period.</p>
			) }
			{ errorMessage && <div>Error: { errorMessage }</div> }
			{ ! isLoading && chartData.length !== 0 && (
				<UplotChart data={ chartData } legendContainer={ legendRef } />
			) }
		</div>
	);
}
