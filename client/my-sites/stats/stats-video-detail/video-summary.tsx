import { SegmentedControl } from '@automattic/components';
import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';
import { useMemo, useState } from 'react';
import QuerySiteStats from 'calypso/components/data/query-site-stats';
import { useLocalizedMoment } from 'calypso/components/localized-moment';
import { useSelector } from 'calypso/state';
import {
	getSiteStatsNormalizedData,
	hasSiteStatsQueryFailed,
	isRequestingSiteStatsForQuery,
} from 'calypso/state/stats/lists/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import { STATS_SUMMARY_MAX_BARS } from '../constants';
import { useMomentInSite } from '../hooks/use-moment-site-zone';
import DatePicker from '../stats-date-label';
import StatsPeriodHeader from '../stats-period-header';
import StatsPeriodNavigation from '../stats-period-navigation';
import SummaryChart from '../stats-summary';
import { calculatePlayWeightedRetention } from './retention';
import VideoMetricTabs, {
	formatValue,
	VideoStatType,
	VideoMetricValues,
} from './video-metric-tabs';

type UiPeriod = 'day' | 'week' | 'month' | 'year';

interface ChartRecord {
	period: string;
	periodLabel: string;
	startDate: string;
	value: number;
	formattedValue?: string;
}

// A range-mode series row from the statsVideo normalizer: the period start
// date plus one value per metric named in the response's `fields`.
interface SeriesRow {
	period: string;
	[ metric: string ]: string | number;
}

interface VideoSummaryData {
	rows?: SeriesRow[] | null;
	metrics?: string[] | null;
	post?: { post_date?: string } | null;
}

const STAT_TYPES: VideoStatType[] = [ 'views', 'impressions', 'watch_time', 'retention_rate' ];

// The endpoint names the views column `plays` (the same metric the Videos
// module and the All videos page label "Views"); the other tabs match their
// column names directly.
const METRIC_COLUMNS: Record< VideoStatType, string > = {
	views: 'plays',
	impressions: 'impressions',
	watch_time: 'watch_time',
	retention_rate: 'retention_rate',
};

function isVideoStatType( value: string | null ): value is VideoStatType {
	return !! value && ( STAT_TYPES as string[] ).includes( value );
}

function metricValue( row: SeriesRow, type: VideoStatType ): number {
	return Number( row[ METRIC_COLUMNS[ type ] ] ) || 0;
}

export default function VideoSummary( {
	postId,
	initialStatType,
}: {
	postId: number;
	initialStatType: string | null;
} ) {
	const translate = useTranslate();
	const moment = useLocalizedMoment();
	const momentSiteZone = useMomentInSite();
	const siteId = useSelector( getSelectedSiteId );
	const [ uiPeriod, setUiPeriod ] = useState< UiPeriod >( 'day' );
	const [ page, setPage ] = useState( 1 );
	const [ statType, setStatType ] = useState< VideoStatType >(
		isVideoStatType( initialStatType ) ? initialStatType : 'views'
	);

	// One request per granularity: statType=all returns every metric series in
	// a single response, and num=-1 windows it from the video's publish date,
	// so the chart can page back through the full history — mirroring how the
	// Post Details chart fetches the post's entire view history up front and
	// pages client-side.
	const query = useMemo(
		() => ( { postId, statType: 'all', period: uiPeriod, num: -1 } ),
		[ postId, uiPeriod ]
	);

	const summaryData = useSelector(
		( state ) =>
			getSiteStatsNormalizedData( state, siteId, 'statsVideo', query ) as VideoSummaryData | null
	);
	const isRequesting = useSelector( ( state ) =>
		siteId ? isRequestingSiteStatsForQuery( state, siteId, 'statsVideo', query ) : false
	);
	const hasFailed = useSelector( ( state ) =>
		siteId ? hasSiteStatsQueryFailed( state, siteId, 'statsVideo', query ) : false
	);

	// QuerySiteStats defers its initial request, so the requesting flag is
	// still false on the first render after switching granularity; treat
	// missing data as loading too, or the empty state flashes before the fetch
	// starts. A failed request also ends the loading state (empty chart
	// instead of an infinite placeholder).
	const isLoaded = !! summaryData || hasFailed;

	const rows = useMemo( () => summaryData?.rows ?? [], [ summaryData ] );
	const availableMetrics = summaryData?.metrics ?? null;

	// Page the full series in most-recent-last chunks, exactly like the Post
	// Details chart ([start, end) bounds per page, page 1 = newest).
	const totalCount = rows.length;
	const maxPages = Math.max( Math.ceil( totalCount / STATS_SUMMARY_MAX_BARS ), 1 );
	const dataStart = Math.max( totalCount - STATS_SUMMARY_MAX_BARS * page, 0 );
	const dataEnd = Math.max( totalCount - STATS_SUMMARY_MAX_BARS * ( page - 1 ), 0 );
	const visibleRows = useMemo(
		() => rows.slice( dataStart, dataEnd ),
		[ rows, dataStart, dataEnd ]
	);

	const chartData: ChartRecord[] = useMemo(
		() =>
			visibleRows.map( ( row ) => {
				const start = moment( row.period );
				const value = metricValue( row, statType );
				// Views and impressions tooltips show the exact count; hours
				// watched and retention rate reuse the metric-tab formatting
				// (one decimal, % suffix) so the tooltip matches the card.
				const record = {
					startDate: row.period,
					value,
					formattedValue:
						statType === 'watch_time' || statType === 'retention_rate'
							? formatValue( statType, value )
							: undefined,
				};
				switch ( uiPeriod ) {
					case 'week':
						return {
							...record,
							period: start.format( 'MMM D' ),
							periodLabel: `${ start.format( 'L' ) } - ${ moment( row.period )
								.add( 6, 'days' )
								.format( 'L' ) }`,
						};
					case 'month':
						return {
							...record,
							period: start.format( 'MMM YYYY' ),
							periodLabel: start.format( 'MMMM YYYY' ),
						};
					case 'year':
						return {
							...record,
							period: start.format( 'YYYY' ),
							periodLabel: start.format( 'YYYY' ),
						};
					default:
						return {
							...record,
							period: start.format( 'MMM D' ),
							periodLabel: start.format( 'LL' ),
						};
				}
			} ),
		[ visibleRows, statType, uiPeriod, moment ]
	);

	// The header shows the date range the visible bars cover (like the Post
	// Details chart's page-range header), so it reads the same across every
	// Day/Week/Month/Year tab and matches Post Details' behavior.
	const chartDateRange = useMemo( () => {
		if ( ! visibleRows.length ) {
			return undefined;
		}

		const start = moment( visibleRows[ 0 ].period );
		let end = moment( visibleRows[ visibleRows.length - 1 ].period );
		switch ( uiPeriod ) {
			case 'week':
				end = end.add( 6, 'days' );
				break;
			case 'month':
				end = end.endOf( 'month' );
				break;
			case 'year':
				end = end.endOf( 'year' );
				break;
			default:
				break;
		}

		// Don't extend the range into the future when the last bucket is
		// still the current, in-progress period. "Today" is the site's, not
		// the viewer's: the buckets are site-local, so a viewer behind the
		// site's timezone must not clamp the header a day short (or vice
		// versa). But never clamp below the newest bucket actually charted:
		// after a timezone change the data can hold buckets past the site's
		// current clock, and the header must still cover the bars it labels.
		// Comparing date keys sidesteps mixed-zone moment math.
		const siteToday = momentSiteZone().format( 'YYYY-MM-DD' );
		const newestBucket = visibleRows[ visibleRows.length - 1 ].period;
		const clampKey = siteToday > newestBucket ? siteToday : newestBucket;
		const chartEnd = end.format( 'YYYY-MM-DD' );

		return {
			chartStart: start.format( 'YYYY-MM-DD' ),
			chartEnd: chartEnd > clampKey ? clampKey : chartEnd,
		};
	}, [ visibleRows, uiPeriod, moment, momentSiteZone ] );

	// Card totals cover the window shown in the chart (the current page).
	// Retention is play-weighted rather than summed — see retention.ts.
	const metricValues: VideoMetricValues = useMemo( () => {
		const sumOf = ( type: VideoStatType ) =>
			visibleRows.reduce( ( total, row ) => total + metricValue( row, type ), 0 );
		const has = ( type: VideoStatType ) =>
			!! availableMetrics && availableMetrics.includes( METRIC_COLUMNS[ type ] );

		let retention: number | null = null;
		if ( has( 'retention_rate' ) && has( 'views' ) ) {
			retention = calculatePlayWeightedRetention(
				visibleRows.map( ( row ) => ( {
					plays: metricValue( row, 'views' ),
					retentionRate: metricValue( row, 'retention_rate' ),
				} ) )
			);
		}

		return {
			views: has( 'views' ) ? sumOf( 'views' ) : null,
			impressions: has( 'impressions' ) ? sumOf( 'impressions' ) : null,
			watch_time: has( 'watch_time' ) ? sumOf( 'watch_time' ) : null,
			retention_rate: retention,
		};
	}, [ visibleRows, availableMetrics ] );

	const selectPeriod = ( newPeriod: UiPeriod ) => () => {
		setUiPeriod( newPeriod );
		setPage( 1 );
	};

	// Arrows page the whole visible window of bars, like the Post Details
	// chart — they never step through individual bars.
	const onPeriodChange = ( { direction }: { direction: string } ) => {
		if ( 'previous' === direction && page < maxPages ) {
			setPage( page + 1 );
		} else if ( 'next' === direction && page > 1 ) {
			setPage( page - 1 );
		}
	};

	const tabLabels: Record< VideoStatType, string > = {
		views: translate( 'Views', { textOnly: true } ),
		impressions: translate( 'Impressions', { textOnly: true } ),
		watch_time: translate( 'Hours watched', { textOnly: true } ),
		retention_rate: translate( 'Retention rate', { textOnly: true } ),
	};

	const periods: Array< { id: UiPeriod; label: string } > = [
		{ id: 'day', label: translate( 'Days', { textOnly: true } ) },
		{ id: 'week', label: translate( 'Weeks', { textOnly: true } ) },
		{ id: 'month', label: translate( 'Months', { textOnly: true } ) },
		{ id: 'year', label: translate( 'Years', { textOnly: true } ) },
	];

	return (
		<div
			className={ clsx( 'stats-video-summary', 'is-chart-tabs', {
				'is-period-year': uiPeriod === 'year',
			} ) }
		>
			{ siteId && (
				<QuerySiteStats key={ uiPeriod } siteId={ siteId } statType="statsVideo" query={ query } />
			) }

			<StatsPeriodHeader>
				<StatsPeriodNavigation
					showArrows
					onPeriodChange={ onPeriodChange }
					disablePreviousArrow={ page >= maxPages }
					disableNextArrow={ page <= 1 }
					date={ null }
				>
					<DatePicker period={ uiPeriod } dateRange={ chartDateRange } isShort />
				</StatsPeriodNavigation>
				<SegmentedControl primary>
					{ periods.map( ( { id, label } ) => (
						<SegmentedControl.Item
							key={ id }
							onClick={ selectPeriod( id ) }
							selected={ uiPeriod === id }
						>
							{ label }
						</SegmentedControl.Item>
					) ) }
				</SegmentedControl>
			</StatsPeriodHeader>

			<SummaryChart
				isLoading={ ( isRequesting || ! isLoaded ) && ! chartData.length }
				data={ chartData }
				activeKey="period"
				dataKey="value"
				labelKey="periodLabel"
				chartType="video"
				sectionClass="is-video"
				tabLabel={ tabLabels[ statType ] }
				type="video"
			/>

			<VideoMetricTabs values={ metricValues } selected={ statType } onSelect={ setStatType } />
		</div>
	);
}
