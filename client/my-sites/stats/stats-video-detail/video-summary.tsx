import { SegmentedControl } from '@automattic/components';
import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';
import { useMemo, useState } from 'react';
import QuerySiteStats from 'calypso/components/data/query-site-stats';
import { useLocalizedMoment } from 'calypso/components/localized-moment';
import { useSelector } from 'calypso/state';
import {
	getSiteStatsNormalizedData,
	isRequestingSiteStatsForQuery,
} from 'calypso/state/stats/lists/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
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
// All videos page label "Views". There is no retention series — retention is
// derived below with the same formula the video-plays complete_stats endpoint
// uses: (watch time / plays) / video duration.
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
	retention: number;
}

interface VideoSummaryData {
	data?: Array< { period: string; value: number } >;
}

const STAT_TYPES: VideoStatType[] = [ 'views', 'impressions', 'watch_time', 'retention_rate' ];

function isVideoStatType( value: string | null ): value is VideoStatType {
	return !! value && ( STAT_TYPES as string[] ).includes( value );
}

function metricOfBucket( bucket: BucketRecord, type: VideoStatType ): number {
	switch ( type ) {
		case 'impressions':
			return bucket.impressions;
		case 'watch_time':
			return bucket.watchTime;
		case 'retention_rate':
			return bucket.retention;
		default:
			return bucket.plays;
	}
}

function computeRetention(
	watchTimeHours: number,
	plays: number,
	videoDuration: number | null
): number {
	if ( ! videoDuration || plays <= 0 ) {
		return 0;
	}
	return ( ( watchTimeHours * 3600 ) / plays / videoDuration ) * 100;
}

export default function VideoSummary( {
	postId,
	initialStatType,
	videoDuration,
}: {
	postId: number;
	initialStatType: string | null;
	videoDuration: number | null;
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

	// Group the fetched buckets (daily or monthly) into the buckets the UI
	// period wants, summing values. Bucket keys are normalized ISO dates.
	const buckets: BucketRecord[] = useMemo( () => {
		const unit = uiPeriod;
		// The endpoint's `month` window spans 31 days inclusive; trim to the
		// trailing 30 so totals line up with the 30-day window the Videos
		// module and the All videos page show by default.
		const trimToWindow = ( data?: Array< { period: string; value: number } > ) =>
			apiPeriod === 'month' && data && data.length > 30 ? data.slice( -30 ) : data;
		const toBucketMap = ( data?: Array< { period: string; value: number } > ) => {
			const map = new Map< string, number >();
			for ( const { period: date, value } of trimToWindow( data ) ?? [] ) {
				const parsed = moment( date );
				if ( ! parsed.isValid() ) {
					continue;
				}
				const key = parsed.startOf( unit ).format( 'YYYY-MM-DD' );
				map.set( key, ( map.get( key ) ?? 0 ) + value );
			}
			return map;
		};

		const playsByBucket = toBucketMap( playsData?.data );
		const impressionsByBucket = toBucketMap( impressionsData?.data );
		const watchTimeByBucket = toBucketMap( watchTimeData?.data );

		const keys = Array.from(
			new Set( [ ...playsByBucket.keys(), ...impressionsByBucket.keys() ] )
		).sort();

		return keys.map( ( key ) => {
			const plays = playsByBucket.get( key ) ?? 0;
			const watchTime = watchTimeByBucket.get( key ) ?? 0;
			return {
				key,
				plays,
				impressions: impressionsByBucket.get( key ) ?? 0,
				watchTime,
				retention: computeRetention( watchTime, plays, videoDuration ),
			};
		} );
	}, [ playsData, impressionsData, watchTimeData, uiPeriod, apiPeriod, videoDuration, moment ] );

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

	const selected =
		selectedRecord ?? ( chartData.length ? chartData[ chartData.length - 1 ] : null );

	// Card totals cover the whole window shown in the chart. Retention is not
	// summable, so the total uses the same canonical formula over the sums.
	const metricValues: VideoMetricValues = useMemo( () => {
		const sum = ( data: VideoSummaryData | null, pick: ( bucket: BucketRecord ) => number ) =>
			data ? buckets.reduce( ( total, bucket ) => total + pick( bucket ), 0 ) : null;

		const playsTotal = sum( playsData, ( bucket ) => bucket.plays );
		const watchTimeTotal = sum( watchTimeData, ( bucket ) => bucket.watchTime );
		const retentionTotal =
			playsTotal !== null && watchTimeTotal !== null && videoDuration && playsTotal > 0
				? computeRetention( watchTimeTotal, playsTotal, videoDuration )
				: null;

		return {
			views: playsTotal,
			impressions: sum( impressionsData, ( bucket ) => bucket.impressions ),
			watch_time: watchTimeTotal,
			retention_rate: retentionTotal,
		};
	}, [ buckets, playsData, impressionsData, watchTimeData, videoDuration ] );

	const selectPeriod = ( newPeriod: UiPeriod ) => () => {
		setUiPeriod( newPeriod );
		setSelectedRecord( null );
	};

	const selectStatType = ( newStatType: VideoStatType ) => {
		setStatType( newStatType );
		setSelectedRecord( null );
	};

	const selectedIndex = selected
		? chartData.findIndex( ( record ) => record.period === selected.period )
		: -1;

	const handleArrows = ( { direction }: { direction: string } ) => {
		if ( selectedIndex === -1 ) {
			return;
		}
		if ( direction === 'previous' && selectedIndex > 0 ) {
			setSelectedRecord( chartData[ selectedIndex - 1 ] );
		} else if ( direction === 'next' && selectedIndex < chartData.length - 1 ) {
			setSelectedRecord( chartData[ selectedIndex + 1 ] );
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

			<StatsPeriodHeader>
				<StatsPeriodNavigation
					showArrows
					onPeriodChange={ handleArrows }
					disablePreviousArrow={ selectedIndex <= 0 }
					disableNextArrow={ selectedIndex === chartData.length - 1 }
					date={ null }
				>
					<DatePicker period={ uiPeriod } date={ selected?.startDate } isShort />
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
				isLoading={ isRequesting && ! chartData.length }
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
