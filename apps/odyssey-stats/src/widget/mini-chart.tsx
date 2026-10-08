import { Notice } from '@wordpress/ui';
import { useTranslate } from 'i18n-calypso';
import { lazy, Suspense, useMemo, useState, FunctionComponent, ReactNode } from 'react';
import useCssVariable from 'calypso/my-sites/stats/hooks/use-css-variable';
import { buildChartData } from 'calypso/my-sites/stats/stats-chart-tabs/utility';
import StatsModulePlaceholder from 'calypso/my-sites/stats/stats-module/placeholder';
import { parseLocalDate } from 'calypso/my-sites/stats/utils';
import useVisitsQuery from '../hooks/use-visits-query';
import { ResolvedDateRange } from '../lib/date-ranges';
import ChartBoundary from './chart-boundary';
import MetricValue from './metric-value';

const OverviewChart = lazy( () => import( './overview-chart' ) );

import './mini-chart.scss';

interface MiniChartProps {
	siteId: number;
	range: ResolvedDateRange;
	/** Shown under the chart, and only with it: not while loading, for an empty range or on an error. */
	footer?: ReactNode;
}

interface VisitRecord {
	period: string;
	views?: number;
	visitors?: number;
}

const CHART_HEIGHT = 160;

const MiniChart: FunctionComponent< MiniChartProps > = ( { siteId, range, footer } ) => {
	const translate = useTranslate();
	const { unit, quantity, endDate } = range;

	// The admin colour scheme's series colours, as on the Stats page's line chart. Read from the
	// widget's own element, since the scheme class that sets them is on the widget root.
	const [ rootElement, setRootElement ] = useState< HTMLDivElement | null >( null );
	const viewsColor = useCssVariable( '--chart-series-views', rootElement );
	const visitorsColor = useCssVariable( '--chart-series-visitors', rootElement );

	// `status`, not `isLoading`: a retry waiting on a hidden tab or a lost connection is still
	// pending, while `isLoading` is false and would read the range as empty.
	const { status, data } = useVisitsQuery( siteId, unit, quantity, endDate );

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
		const chartData = buildChartData( [ 'visitors' ], 'views', data, unit, endDate );
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
	}, [ data, unit, endDate, viewsColor, visitorsColor, translate ] );

	const isPending = status === 'pending';
	const isEmpty = status === 'success' && totals.views === 0 && totals.visitors === 0;
	const hasChart = status === 'success' && ! isEmpty;
	// Fixed, so the card keeps its height from the placeholder to the chart.
	const chartBoxStyle = { blockSize: `${ CHART_HEIGHT }px` };
	const noData = (
		<p className="stats-widget-minichart__error">{ translate( 'No data to show' ) }</p>
	);

	return (
		<div className="stats-widget-minichart" ref={ setRootElement }>
			{ ( isPending || hasChart ) && (
				<div className="stats-widget-metrics">
					<div className="stats-widget-metric">
						<div className="stats-widget-metric__title">
							{ translate( 'Views', { context: 'noun' } ) }
							<span className="stats-widget-metric__swatch is-views" aria-hidden="true" />
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
							<span className="stats-widget-metric__swatch is-visitors" aria-hidden="true" />
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

			{ isPending && (
				<div className="stats-widget-chart" style={ chartBoxStyle }>
					<StatsModulePlaceholder isLoading />
				</div>
			) }
			{ isEmpty && (
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
			{ status === 'error' && noData }
			{ hasChart && (
				// Around the chart alone, so a failed chart takes only its own box with it.
				<ChartBoundary fallback={ noData }>
					{ /* The footer waits with the chart: data can arrive before the chart's chunk does. */ }
					<Suspense
						fallback={
							<div className="stats-widget-chart" style={ chartBoxStyle }>
								<StatsModulePlaceholder isLoading />
							</div>
						}
					>
						<div className="stats-widget-chart" style={ chartBoxStyle }>
							<OverviewChart series={ series } height={ CHART_HEIGHT } unit={ unit } />
						</div>
						{ footer }
					</Suspense>
				</ChartBoundary>
			) }
		</div>
	);
};

export default MiniChart;
