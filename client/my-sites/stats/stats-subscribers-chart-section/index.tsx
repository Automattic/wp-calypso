import config from '@automattic/calypso-config';
import { UseQueryResult } from '@tanstack/react-query';
import { useTranslate } from 'i18n-calypso';
import { useCallback, useEffect, useRef, useState } from 'react';
import Intervals from 'calypso/blocks/stats-navigation/intervals';
import AsyncLoad from 'calypso/components/async-load';
import UplotChart from 'calypso/components/chart-uplot';
import useSubscribersQuery from 'calypso/my-sites/stats/hooks/use-subscribers-query';
import { useSelector } from 'calypso/state';
import StatsModulePlaceholder from '../stats-module/placeholder';
import StatsPeriodHeader from '../stats-period-header';
import { hideFractionNumber } from './chart-utils';
import SubscribersNavigationArrows from './subscribers-navigation-arrows';
import type uPlot from 'uplot';

import './style.scss';

interface SubscribersData {
	period: PeriodType;
	subscribers: number;
	subscribers_change: number;
	subscribers_paid: number;
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
function transformData(
	data: SubscribersData[],
	hasAddedPaidSubscriptionProduct: boolean
): uPlot.AlignedData {
	// Transform the data into the format required by uPlot.
	//
	// Note that the incoming data is ordered ascending (newest to oldest)
	// but uPlot expects descending in its deafult configuration.
	const x: number[] = data.map( ( point ) => Number( new Date( point.period ) ) / 1000 ).reverse();
	// Reserve null values for points with no data.
	const y1: Array< number | null > = data
		.map( ( point ) => ( point.subscribers === null ? null : Number( point.subscribers ) ) )
		.reverse();

	// Add a second line for paid subscribers to the chart when users have added a paid subscription product.
	if ( hasAddedPaidSubscriptionProduct ) {
		const y2: Array< number | null > = data
			.map( ( point ) =>
				point.subscribers_paid === null ? null : Number( point.subscribers_paid )
			)
			.reverse();

		return [ x, y1, y2 ];
	}

	return [ x, y1 ];
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
	const isChartLibraryEnabled = config.isEnabled( 'stats/chart-library' );
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

	const products = useSelector( ( state ) => state.memberships?.productList?.items[ siteId ?? 0 ] );

	// Products with an undefined value rather than an empty array means the API call has not been completed yet.
	const isPaidSubscriptionProductsLoading = ! products;
	const isChartLoading = isLoading || isPaidSubscriptionProductsLoading;

	const hasAddedPaidSubscriptionProduct = products && products.length > 0;
	const chartData = transformData( data?.data || [], hasAddedPaidSubscriptionProduct );

	const subscribers = {
		label: 'Subscribers',
		path: `/stats/subscribers/`,
	};

	const slugPath = slug ? `/${ slug }` : '';
	const pathTemplate = `${ subscribers.path }{{ interval }}${ slugPath }`;

	const subscribersUrl = isOdysseyStats
		? `https://cloud.jetpack.com/subscribers/${ slug }`
		: `/subscribers/${ slug }`;

	return (
		<div className="subscribers-section">
			{ /* TODO: Remove highlight-cards class and use a highlight cards heading component instead. */ }
			<div className="subscribers-section-heading highlight-cards">
				<h1 className="highlight-cards-heading">
					{ translate( 'Subscribers' ) }{ ' ' }
					<small>
						<a className="highlight-cards-heading-wrapper" href={ subscribersUrl }>
							{ translate( 'View all subscribers' ) }
						</a>
					</small>
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
							<Intervals selected={ period } pathTemplate={ pathTemplate } compact />
						</StatsPeriodHeader>
					</div>
				</div>
			</div>
			{ isChartLoading && <StatsModulePlaceholder className="is-chart" isLoading /> }
			{ ! isChartLoading && chartData.length === 0 && (
				<p className="subscribers-section__no-data">
					{ translate( 'No data available for the specified period.' ) }
				</p>
			) }
			{ errorMessage && <div>Error: { errorMessage }</div> }
			{ ! isChartLoading && chartData.length !== 0 && (
				<>
					<div className="subscribers-section-legend" ref={ legendRef }></div>
					{ isChartLibraryEnabled ? (
						<AsyncLoad
							require="calypso/my-sites/stats/components/line-chart"
							chartData={ [
								{
									label: 'Subscribers',
									options: {
										stroke: '#069e08',
									},
									data: data?.data?.map( ( point ) => ( {
										date: new Date( point.period ),
										value: point.subscribers || 0,
									} ) ) || [
										// Fallback dummy data if no real data available
										{ date: new Date( '2024-01-01' ), value: 10 },
										{ date: new Date( '2024-01-08' ), value: 15 },
										{ date: new Date( '2024-01-15' ), value: 12 },
										{ date: new Date( '2024-01-22' ), value: 18 },
										{ date: new Date( '2024-01-29' ), value: 20 },
									],
								},
							] }
							height={ 300 }
						/>
					) : (
						<UplotChart
							data={ chartData }
							legendContainer={ legendRef }
							period={ period }
							// Use variable --studio-jetpack-green for chart colors on Odyssey Stats.
							mainColor={ isOdysseyStats ? '#069e08' : undefined }
							fillColorFrom={ isOdysseyStats ? 'rgba(6, 158, 8, 0.4)' : undefined }
							fillColorTo={ isOdysseyStats ? 'rgba(6, 158, 8, 0)' : undefined }
							yAxisFilter={ hideFractionNumber }
						/>
					) }
				</>
			) }
		</div>
	);
}
