import { Notice } from '@wordpress/ui';
import { useTranslate } from 'i18n-calypso';
import moment from 'moment';
import { lazy, Suspense, useMemo, FunctionComponent } from 'react';
import useCssVariable from 'calypso/my-sites/stats/hooks/use-css-variable';
import { buildChartData } from 'calypso/my-sites/stats/stats-chart-tabs/utility';
import StatsModulePlaceholder from 'calypso/my-sites/stats/stats-module/placeholder';
import useVisitsQuery from '../hooks/use-visits-query';
import { DateRange } from '../lib/date-ranges';
import { deriveSeriesColors } from '../lib/series-colors';
import MetricValue from './metric-value';

const OverviewChart = lazy( () => import( './overview-chart' ) );

import './mini-chart.scss';

interface MiniChartProps {
	siteId: number;
	gmtOffset: number;
	statsBaseUrl: string;
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

	// The chart follows the colour WordPress publishes for the current user's admin
	// scheme, so it changes with their profile rather than being pinned to one palette.
	// Read from `body`, not the hook's default `:root`: the scheme stylesheet sets the
	// variable on `body.admin-color-*`, while `:root` only carries wp-admin's default blue.
	const primaryColor = useCssVariable( '--wp-admin-theme-color', document.body );
	const [ viewsColor, visitorsColor ] = deriveSeriesColors( primaryColor );

	const queryDate = moment()
		.utcOffset( Number.isFinite( gmtOffset ) ? gmtOffset : 0 )
		.format( 'YYYY-MM-DD' );

	const { isLoading, data } = useVisitsQuery( siteId, unit, quantity, queryDate );

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
					date: new Date( record.data.period ),
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

	const isEmpty = totals.views === 0 && totals.visitors === 0;

	return (
		<div className="stats-widget-minichart">
			{ /* Hidden once a range comes back empty: a pair of zeros would read as "no
			   traffic" rather than "no stats yet", which is what the notice below says. */ }
			{ ( isLoading || ! isEmpty ) && (
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

			{ /* A fixed box while loading and for the chart, so the card does not resize
			   when one replaces the other. It also gives the responsive chart a definite
			   parent to measure, which is what stops it growing without bound. The empty
			   notice has nothing to measure and would only leave a gap below it, so it
			   sizes to its content. */ }
			<div
				className="stats-widget-chart"
				style={ isLoading || ! isEmpty ? { blockSize: `${ CHART_HEIGHT }px` } : undefined }
			>
				{ isLoading && <StatsModulePlaceholder isLoading /> }
				{ ! isLoading && isEmpty && (
					// The Notice Jetpack's current screens use (VideoPress, Backup, Boost), from
					// the WordPress design system. Its styles ship inside its JS with token
					// fallbacks, so it renders the same whether or not wp-admin defines them.
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
				{ ! isLoading && ! isEmpty && (
					<Suspense fallback={ <StatsModulePlaceholder isLoading /> }>
						<OverviewChart series={ series } height={ CHART_HEIGHT } />
					</Suspense>
				) }
			</div>
		</div>
	);
};

export default MiniChart;
