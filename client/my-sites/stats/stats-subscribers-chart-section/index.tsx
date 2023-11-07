import config from '@automattic/calypso-config';
import UplotChart from '@automattic/components/src/chart-uplot';
import { UseQueryResult } from '@tanstack/react-query';
import { useTranslate } from 'i18n-calypso';
import { useCallback, useEffect, useRef, useState } from 'react';
import Intervals from 'calypso/blocks/stats-navigation/intervals';
import useSubscribersQuery from 'calypso/my-sites/stats/hooks/use-subscribers-query';
import StatsModulePlaceholder from '../stats-module/placeholder';
import StatsPeriodHeader from '../stats-period-header';
import SubscribersNavigationArrows from './subscribers-navigation-arrows';
import type uPlot from 'uplot';

import './style.scss';

interface SubscribersData {
	period: PeriodType;
	subscribers: number;
	subscribers_change: number;
}

interface SubscribersDataResult {
	data: SubscribersData[];
	unit: string;
	date: string;
}

interface QuantityDefaultType {
	day: number;
	week: number;
	month: number;
	year: number;
}

export type PeriodType = 'day' | 'week' | 'month' | 'year';

// New Subscriber Stats
function transformData( data: SubscribersData[] ): uPlot.AlignedData {
	// Transform the data into the format required by uPlot.
	//
	// Note that the incoming data is ordered ascending (newest to oldest)
	// but uPlot expects descending in its deafult configuration.
	const x: number[] = data.map( ( point ) => Number( new Date( point.period ) ) / 1000 ).reverse();
	// Reserve null values for points with no data.
	const y: Array< number | null > = data
		.map( ( point ) => ( point.subscribers === null ? null : Number( point.subscribers ) ) )
		.reverse();

	return [ x, y ];
}

export default function SubscribersChartSection( {
	siteId,
	slug,
	period = 'month',
}: {
	siteId: number | null;
	slug?: string | null;
	period?: PeriodType;
} ) {
	const isOdysseyStats = config.isEnabled( 'is_running_in_jetpack_site' );
	const quantityDefault: QuantityDefaultType = {
		day: 30,
		week: 12,
		month: 6,
		year: 3,
	};
	const quantity = quantityDefault[ period as keyof QuantityDefaultType ];
	const [ queryDate, setQueryDate ] = useState( new Date() );
	const [ errorMessage, setErrorMessage ] = useState( '' );
	const legendRef = useRef< HTMLDivElement >( null );
	const translate = useTranslate();

	const {
		isLoading,
		isError,
		data,
		// error,
		status,
	} = useSubscribersQuery(
		siteId,
		period,
		quantity,
		queryDate
	) as UseQueryResult< SubscribersDataResult >;

	const handleDateChange = useCallback(
		( newDate: Date ) => setQueryDate( new Date( newDate.getTime() ) ), // unless new Date is created, the component won't rerender
		[ setQueryDate ]
	);

	// reset the date when changing periods
	useEffect( () => {
		setQueryDate( new Date() );
	}, [ period, setQueryDate ] );

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

	const slugPath = slug ? `/${ slug }` : '';
	const pathTemplate = `${ subscribers.path }{{ interval }}${ slugPath }`;

	return (
		<div className="subscribers-section">
			{ /* TODO: Remove highlight-cards class and use a highlight cards heading component instead. */ }
			<div className="subscribers-section-heading highlight-cards">
				<h1 className="highlight-cards-heading">
					{ translate( 'Subscribers' ) }{ ' ' }
					{ isOdysseyStats ? null : (
						<small>
							<a className="highlight-cards-heading-wrapper" href={ '/people/subscribers/' + slug }>
								{ translate( 'View all subscribers' ) }
							</a>
						</small>
					) }
				</h1>
				<div className="subscribers-section-heading__chart-controls">
					<SubscribersNavigationArrows
						date={ queryDate }
						period={ period }
						quantity={ quantity }
						onDateChange={ handleDateChange }
					/>
					<div className="subscribers-section-duration-control-with-legend">
						<StatsPeriodHeader>
							<Intervals selected={ period } pathTemplate={ pathTemplate } compact={ true } />
						</StatsPeriodHeader>
						<div className="subscribers-section-legend" ref={ legendRef }></div>
					</div>
				</div>
			</div>
			{ isLoading && <StatsModulePlaceholder className="is-chart" isLoading /> }
			{ ! isLoading && chartData.length === 0 && (
				<p className="subscribers-section__no-data">
					{ translate( 'No data available for the specified period.' ) }
				</p>
			) }
			{ errorMessage && <div>Error: { errorMessage }</div> }
			{ ! isLoading && chartData.length !== 0 && (
				<UplotChart data={ chartData } legendContainer={ legendRef } period={ period } />
			) }
		</div>
	);
}
