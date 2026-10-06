import { Notice } from '@wordpress/ui';
import { useTranslate } from 'i18n-calypso';
import moment from 'moment';
import { lazy, Suspense, useMemo, FunctionComponent } from 'react';
import useCssVariable from 'calypso/my-sites/stats/hooks/use-css-variable';
import { buildChartData } from 'calypso/my-sites/stats/stats-chart-tabs/utility';
import StatsModulePlaceholder from 'calypso/my-sites/stats/stats-module/placeholder';
import { parseLocalDate } from 'calypso/my-sites/stats/utils';
import useVisitsQuery from '../hooks/use-visits-query';
import { DateRange } from '../lib/date-ranges';
import { deriveSeriesColors } from '../lib/series-colors';
import ChartBoundary from './chart-boundary';
import MetricValue from './metric-value';

const OverviewChart = lazy( () => import( './overview-chart' ) );

import './mini-chart.scss';

interface MiniChartProps {
	siteId: number;
	gmtOffset: number;
	range: DateRange;
}

interface VisitRecord {
	period: string;
	views?: number;
	visitors?: number;
}

const CHART_HEIGHT = 160;

const MiniChart: FunctionComponent< MiniChartProps > = ( { siteId, gmtOffset, range } ) => {
	const translate = useTranslate();
	const { unit, quantity } = range;

	// The chart follows the user's admin colour scheme. Read from `body`: the scheme sets
	// the variable there, while `:root` only carries wp-admin's default blue.
	const primaryColor = useCssVariable( '--wp-admin-theme-color', document.body );
	const [ viewsColor, visitorsColor ] = deriveSeriesColors( primaryColor );

	const queryDate = moment()
		.utcOffset( Number.isFinite( gmtOffset ) ? gmtOffset : 0 )
		.format( 'YYYY-MM-DD' );

	// Pending rather than loading: a retry waits while the tab is hidden or offline, and
	// `isLoading` is false while it waits, so the range would read as empty until it ran.
	const { isPending, isError, data } = useVisitsQuery( siteId, unit, quantity, queryDate );

	const totals = useMemo( () => {
		const records = ( data ?? [] ) as VisitRecord[];
		return records.reduce(
			( accumulator, record ) => ( {
				views: accumulator.views + ( record.views ?? 0 ),
				visitors: accumulator.visitors + ( record.visitors ?? 0 ),
			} ),
			{ views: 0, visitors: 0 }
		);
	}, [ data ] );

	const series = useMemo( () => {
		const chartData = buildChartData( [ 'visitors' ], 'views', data, unit, queryDate );
		const toPoints = ( attribute: 'views' | 'visitors' ) =>
			chartData
				.map( ( record: { data: VisitRecord } ) => ( {
					// Periods are bare dates ("2026-09-20"), which `new Date()` reads as UTC
					// midnight: behind UTC that lands each point on the previous evening.
					date: parseLocalDate( record.data.period ),
					value: record.data[ attribute ] ?? 0,
				} ) )
				.filter( ( point: { date: Date } ) => ! isNaN( point.date.getTime() ) );

		return [
			{
				label: translate( 'Views', { context: 'noun' } ) as string,
				data: toPoints( 'views' ),
				options: { stroke: viewsColor },
			},
			{
				label: translate( 'Visitors', { context: 'noun' } ) as string,
				data: toPoints( 'visitors' ),
				options: { stroke: visitorsColor },
			},
		];
	}, [ data, unit, queryDate, viewsColor, visitorsColor, translate ] );

	// A failed request is not an empty range: its zeros would read as "no traffic" while
	// the lists below may still show views, so it gets its own message instead.
	const isEmpty = ! isError && totals.views === 0 && totals.visitors === 0;
	const hasChart = ! isPending && ! isError && ! isEmpty;

	return (
		<div className="stats-widget-minichart">
			{ /* Hidden for an empty range or a failed request, where zeros would read as "no traffic". */ }
			{ ( isPending || hasChart ) && (
				<div className="stats-widget-metrics">
					<div className="stats-widget-metric">
						<div className="stats-widget-metric__title">
							{ translate( 'Views', { context: 'noun' } ) }
							<span
								className="stats-widget-metric__swatch"
								style={ { backgroundColor: viewsColor } }
								aria-hidden="true"
							/>
						</div>
						<MetricValue
							value={ totals.views }
							describe={ ( count ) =>
								translate( '%(count)s view', '%(count)s views', {
									count: totals.views,
									args: { count },
								} ) as string
							}
						/>
					</div>
					<div className="stats-widget-metric">
						<div className="stats-widget-metric__title">
							{ translate( 'Visitors', { context: 'noun' } ) }
							<span
								className="stats-widget-metric__swatch"
								style={ { backgroundColor: visitorsColor } }
								aria-hidden="true"
							/>
						</div>
						<MetricValue
							value={ totals.visitors }
							describe={ ( count ) =>
								translate( '%(count)s visitor', '%(count)s visitors', {
									count: totals.visitors,
									args: { count },
								} ) as string
							}
						/>
					</div>
				</div>
			) }

			{ /* A fixed height while loading and for the chart, so the card doesn't resize
			   between them; the empty notice sizes to its content. The boundary wraps the
			   box rather than the chart alone, so a chart that fails leaves no empty space
			   behind — the totals above it stay either way. */ }
			<ChartBoundary fallback={ null }>
				<div
					className="stats-widget-chart"
					style={ isPending || hasChart ? { blockSize: `${ CHART_HEIGHT }px` } : undefined }
				>
					{ isPending && <StatsModulePlaceholder isLoading /> }
					{ ! isPending && isEmpty && (
						<Notice.Root intent="info" className="stats-widget-empty-notice">
							<Notice.Description>
								{ translate( 'We are collecting traffic data for your site' ) }
							</Notice.Description>
							<Notice.Actions>
								<Notice.ActionLink href="https://jetpack.com/stats/" openInNewTab>
									{ translate( 'Learn more about stats' ) }
								</Notice.ActionLink>
							</Notice.Actions>
						</Notice.Root>
					) }
					{ ! isPending && isError && (
						<p className="stats-widget-minichart__error">{ translate( 'No data to show' ) }</p>
					) }
					{ hasChart && (
						<Suspense fallback={ <StatsModulePlaceholder isLoading /> }>
							<OverviewChart series={ series } height={ CHART_HEIGHT } unit={ unit } />
						</Suspense>
					) }
				</div>
			</ChartBoundary>
		</div>
	);
};

export default MiniChart;
