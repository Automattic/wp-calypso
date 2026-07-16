import { SegmentedControl } from '@automattic/components';
import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';
import { useCallback, useMemo, useState } from 'react';
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
import DatePicker from '../stats-date-label';
import StatsPeriodHeader from '../stats-period-header';
import StatsPeriodNavigation from '../stats-period-navigation';
import SummaryChart from '../stats-summary';
import VideoMetricTabs, { VideoStatType, VideoMetricValues } from './video-metric-tabs';

type UiPeriod = 'day' | 'week' | 'month' | 'year';

// The stats/video/:id endpoint treats `period` as a fixed trailing-window
// selector, not a bucket granularity: `month` returns ~31 daily buckets and
// `year` returns ~13 monthly buckets (there are no weekly or yearly buckets,
// and `day`/`week` windows are too small to chart). So we fetch the daily
// window for the Days/Weeks views and the monthly window for Months/Years,
// then aggregate client-side.
type ApiPeriod = 'month' | 'year';

// The endpoint only recognizes statType=watch_time|impressions; `views` falls
// back to the plays column, which is the same metric the Videos module and the
// All videos page label "Views".
const FETCHED_STAT_TYPES = [ 'views', 'impressions', 'watch_time' ] as const;

interface ChartRecord {
	period: string;
	periodLabel: string;
	startDate: string;
	value: number;
}

interface BucketRecord {
	key: string;
	plays: number;
	impressions: number;
	watchTime: number;
}

interface VideoSummaryData {
	data?: Array< { period: string; value: number } >;
	post?: { post_date?: string } | null;
}

const STAT_TYPES: VideoStatType[] = [ 'views', 'impressions', 'watch_time' ];

function isVideoStatType( value: string | null ): value is VideoStatType {
	return !! value && ( STAT_TYPES as string[] ).includes( value );
}

function metricOfBucket( bucket: BucketRecord, type: VideoStatType ): number {
	switch ( type ) {
		case 'impressions':
			return bucket.impressions;
		case 'watch_time':
			return bucket.watchTime;
		default:
			return bucket.plays;
	}
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
	const siteId = useSelector( getSelectedSiteId );
	const [ uiPeriod, setUiPeriod ] = useState< UiPeriod >( 'day' );
	const [ statType, setStatType ] = useState< VideoStatType >(
		isVideoStatType( initialStatType ) ? initialStatType : 'views'
	);
	const [ selectedRecord, setSelectedRecord ] = useState< ChartRecord | null >( null );

	const apiPeriod: ApiPeriod = uiPeriod === 'day' || uiPeriod === 'week' ? 'month' : 'year';

	// The video's publish date, so the chart never shows periods before the
	// video existed. Always queried with period=month (rather than reusing
	// `apiPeriod`, which can be 'year') to mirror the parent StatsVideoDetail
	// component's videoInfoQuery, so this reuses the same cached response.
	const videoInfoQuery = useMemo(
		() => ( { postId, statType: 'views', period: 'month' as const } ),
		[ postId ]
	);
	const videoPublishDate = useSelector(
		( state ) =>
			(
				getSiteStatsNormalizedData(
					state,
					siteId,
					'statsVideo',
					videoInfoQuery
				) as VideoSummaryData | null
			 )?.post?.post_date ?? null
	);

	// The endpoint's `month` window spans 31 days inclusive; trim to the
	// trailing 30 so totals line up with the 30-day window the Videos module
	// and the All videos page show by default, and drop any raw entry before
	// the video's publish date. Shared by the bucketing below and by the
	// header's date-range label, so both agree on the window.
	const trimToTrailingWindow = useCallback(
		(
			data?: Array< { period: string; value: number } >
		): Array< { period: string; value: number } > | undefined => {
			const trimmed = apiPeriod === 'month' && data && data.length > 30 ? data.slice( -30 ) : data;
			if ( ! trimmed || ! videoPublishDate ) {
				return trimmed;
			}
			// apiPeriod === 'year' raw entries are whole months (e.g.
			// '2026-07'); comparing those at day granularity would drop the
			// publish month entirely for a video published mid-month.
			const unit = apiPeriod === 'year' ? 'month' : 'day';
			return trimmed.filter(
				( { period } ) => ! moment( period ).isBefore( videoPublishDate, unit )
			);
		},
		[ apiPeriod, videoPublishDate, moment ]
	);

	const queries = useMemo(
		() =>
			Object.fromEntries(
				FETCHED_STAT_TYPES.map( ( type ) => [
					type,
					{ postId, statType: type, period: apiPeriod },
				] )
			) as Record<
				( typeof FETCHED_STAT_TYPES )[ number ],
				{ postId: number; statType: string; period: ApiPeriod }
			>,
		[ postId, apiPeriod ]
	);

	const playsData = useSelector(
		( state ) =>
			getSiteStatsNormalizedData(
				state,
				siteId,
				'statsVideo',
				queries.views
			) as VideoSummaryData | null
	);
	const impressionsData = useSelector(
		( state ) =>
			getSiteStatsNormalizedData(
				state,
				siteId,
				'statsVideo',
				queries.impressions
			) as VideoSummaryData | null
	);
	const watchTimeData = useSelector(
		( state ) =>
			getSiteStatsNormalizedData(
				state,
				siteId,
				'statsVideo',
				queries.watch_time
			) as VideoSummaryData | null
	);
	const isRequesting = useSelector( ( state ) =>
		siteId
			? FETCHED_STAT_TYPES.some( ( type ) =>
					isRequestingSiteStatsForQuery( state, siteId, 'statsVideo', queries[ type ] )
			  )
			: false
	);

	const hasSelectedSeriesFailed = useSelector( ( state ) =>
		siteId ? hasSiteStatsQueryFailed( state, siteId, 'statsVideo', queries[ statType ] ) : false
	);

	// QuerySiteStats defers its initial request, so the requesting flag is
	// still false on the first render after switching windows; treat missing
	// data as loading too, or the empty state flashes before the fetch starts.
	// A failed request also ends the loading state (empty chart instead of an
	// infinite placeholder).
	const isSelectedSeriesLoaded =
		!! {
			views: playsData,
			impressions: impressionsData,
			watch_time: watchTimeData,
		}[ statType ] || hasSelectedSeriesFailed;

	// Group the fetched buckets (daily or monthly) into the buckets the UI
	// period wants, summing values. Bucket keys are normalized ISO dates.
	const buckets: BucketRecord[] = useMemo( () => {
		const unit = uiPeriod;
		const toBucketMap = ( data?: Array< { period: string; value: number } > ) => {
			const map = new Map< string, number >();
			for ( const { period: date, value } of trimToTrailingWindow( data ) ?? [] ) {
				const parsed = moment( date );
				if ( ! parsed.isValid() ) {
					continue;
				}
				// Stats weeks run Monday-Sunday (see stats-date-label); isoWeek
				// matches that regardless of the user's locale.
				const key = parsed.startOf( unit === 'week' ? 'isoWeek' : unit ).format( 'YYYY-MM-DD' );
				map.set( key, ( map.get( key ) ?? 0 ) + value );
			}
			return map;
		};

		const playsByBucket = toBucketMap( playsData?.data );
		const impressionsByBucket = toBucketMap( impressionsData?.data );
		const watchTimeByBucket = toBucketMap( watchTimeData?.data );

		const keys = Array.from(
			new Set( [
				...playsByBucket.keys(),
				...impressionsByBucket.keys(),
				...watchTimeByBucket.keys(),
			] )
		).sort();

		// Cap Weeks/Months/Years to the most recent STATS_SUMMARY_MAX_BARS
		// buckets so they show the same amount of history per view as the
		// Post Details chart, which pages in chunks of the same size. Weeks/
		// Years will still fall short of that cap: the endpoint's `month`/
		// `year` windows only cover ~30 days / ~13 months of raw data, which
		// bucket into fewer than 10 weeks/years regardless of this cap —
		// there's no more granular data to draw from without a backend
		// change. Days aren't capped; there's no pagination for this chart,
		// so it shows the full ~30-day window it always has.
		const cappedKeys = uiPeriod === 'day' ? keys : keys.slice( -STATS_SUMMARY_MAX_BARS );
		return cappedKeys.map( ( key ) => ( {
			key,
			plays: playsByBucket.get( key ) ?? 0,
			impressions: impressionsByBucket.get( key ) ?? 0,
			watchTime: watchTimeByBucket.get( key ) ?? 0,
		} ) );
	}, [ playsData, impressionsData, watchTimeData, uiPeriod, trimToTrailingWindow, moment ] );

	const chartData: ChartRecord[] = useMemo(
		() =>
			buckets.map( ( bucket ) => {
				const start = moment( bucket.key );
				const value = metricOfBucket( bucket, statType );
				switch ( uiPeriod ) {
					case 'week':
						return {
							period: start.format( 'MMM D' ),
							periodLabel: `${ start.format( 'L' ) } - ${ moment( bucket.key )
								.add( 6, 'days' )
								.format( 'L' ) }`,
							startDate: bucket.key,
							value,
						};
					case 'month':
						return {
							period: start.format( 'MMM YYYY' ),
							periodLabel: start.format( 'MMMM YYYY' ),
							startDate: bucket.key,
							value,
						};
					case 'year':
						return {
							period: start.format( 'YYYY' ),
							periodLabel: start.format( 'YYYY' ),
							startDate: bucket.key,
							value,
						};
					default:
						return {
							period: start.format( 'MMM D' ),
							periodLabel: start.format( 'LL' ),
							startDate: bucket.key,
							value,
						};
				}
			} ),
		[ buckets, statType, uiPeriod, moment ]
	);

	// No bar is highlighted by default; the header shows the range instead of
	// a single bar's date, so defaulting to the most recent bar would highlight
	// it for no reason until the user actually clicks one.
	const selected = selectedRecord;

	// The header shows the date range the visible bars cover (like the Post
	// Details chart's page-range header), rather than the period of whichever
	// single bar is selected, so it reads the same across every
	// Day/Week/Month/Year tab and matches Post Details' behavior.
	const chartDateRange = useMemo( () => {
		if ( ! buckets.length ) {
			return undefined;
		}

		const start = moment( buckets[ 0 ].key );
		let end = moment( buckets[ buckets.length - 1 ].key );
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
		// still the current, in-progress period.
		const today = moment();
		if ( end.isAfter( today, 'day' ) ) {
			end = today;
		}

		return {
			chartStart: start.format( 'YYYY-MM-DD' ),
			chartEnd: end.format( 'YYYY-MM-DD' ),
		};
	}, [ buckets, uiPeriod, moment ] );

	// Card totals cover the whole window shown in the chart.
	const metricValues: VideoMetricValues = useMemo( () => {
		const sum = ( data: VideoSummaryData | null, pick: ( bucket: BucketRecord ) => number ) =>
			data ? buckets.reduce( ( total, bucket ) => total + pick( bucket ), 0 ) : null;

		return {
			views: sum( playsData, ( bucket ) => bucket.plays ),
			impressions: sum( impressionsData, ( bucket ) => bucket.impressions ),
			watch_time: sum( watchTimeData, ( bucket ) => bucket.watchTime ),
		};
	}, [ buckets, playsData, impressionsData, watchTimeData ] );

	const selectPeriod = ( newPeriod: UiPeriod ) => () => {
		setUiPeriod( newPeriod );
		setSelectedRecord( null );
	};

	const selectStatType = ( newStatType: VideoStatType ) => {
		setStatType( newStatType );
		setSelectedRecord( null );
	};

	const tabLabels: Record< VideoStatType, string > = {
		views: translate( 'Views', { textOnly: true } ),
		impressions: translate( 'Impressions', { textOnly: true } ),
		watch_time: translate( 'Hours watched', { textOnly: true } ),
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
				'has-less-than-three-bars': chartData.length > 0 && chartData.length < 3,
			} ) }
		>
			{ siteId &&
				FETCHED_STAT_TYPES.map( ( type ) => (
					<QuerySiteStats
						key={ `${ type }-${ apiPeriod }` }
						siteId={ siteId }
						statType="statsVideo"
						query={ queries[ type ] }
					/>
				) ) }
			{ /* apiPeriod is already 'month' on the Days/Weeks tabs, so
			queries.views above is this exact query already; only fetch it
			separately when viewing Months/Years. */ }
			{ siteId && apiPeriod !== 'month' && (
				<QuerySiteStats
					key="video-info"
					siteId={ siteId }
					statType="statsVideo"
					query={ videoInfoQuery }
				/>
			) }

			<StatsPeriodHeader>
				{ /* The video stats endpoint only returns a fixed trailing window
				ending "now" (no backend support yet for an older window), so
				there's no previous/next period to navigate to; the arrows are
				hidden rather than shown disabled. */ }
				<StatsPeriodNavigation showArrows={ false } date={ null }>
					<DatePicker
						period={ uiPeriod }
						date={ selected?.startDate }
						dateRange={ chartDateRange }
						isShort
					/>
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
				isLoading={ ( isRequesting || ! isSelectedSeriesLoaded ) && ! chartData.length }
				data={ chartData }
				activeKey="period"
				dataKey="value"
				labelKey="periodLabel"
				chartType="video"
				sectionClass="is-video"
				selected={ selected }
				onClick={ setSelectedRecord }
				tabLabel={ tabLabels[ statType ] }
				type="video"
			/>

			<VideoMetricTabs values={ metricValues } selected={ statType } onSelect={ selectStatType } />
		</div>
	);
}
