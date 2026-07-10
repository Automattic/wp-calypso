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

type Period = 'day' | 'week' | 'month' | 'year';

interface ChartRecord {
	period: string;
	periodLabel: string;
	startDate: string;
	value: number;
}

interface VideoSummaryData {
	data?: Array< { period: string; value: number } >;
}

const STAT_TYPES: VideoStatType[] = [ 'views', 'impressions', 'watch_time', 'retention_rate' ];

const MAX_RECORDS_PER_DAY = 30;

function isVideoStatType( value: string | null ): value is VideoStatType {
	return !! value && ( STAT_TYPES as string[] ).includes( value );
}

export default function VideoSummary( {
	postId,
	initialStatType,
	uploadDate,
}: {
	postId: number;
	initialStatType: string | null;
	uploadDate: string | null;
} ) {
	const translate = useTranslate();
	const moment = useLocalizedMoment();
	const siteId = useSelector( getSelectedSiteId );
	const [ period, setPeriod ] = useState< Period >( 'day' );
	const [ statType, setStatType ] = useState< VideoStatType >(
		isVideoStatType( initialStatType ) ? initialStatType : 'views'
	);
	const [ selectedRecord, setSelectedRecord ] = useState< ChartRecord | null >( null );
	const [ page, setPage ] = useState( 1 );

	const queries = useMemo(
		() =>
			Object.fromEntries(
				STAT_TYPES.map( ( type ) => [ type, { postId, statType: type, period } ] )
			) as Record< VideoStatType, { postId: number; statType: VideoStatType; period: Period } >,
		[ postId, period ]
	);

	const viewsData = useSelector(
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
	const retentionData = useSelector(
		( state ) =>
			getSiteStatsNormalizedData(
				state,
				siteId,
				'statsVideo',
				queries.retention_rate
			) as VideoSummaryData | null
	);
	const isRequesting = useSelector( ( state ) =>
		siteId
			? isRequestingSiteStatsForQuery( state, siteId, 'statsVideo', queries[ statType ] )
			: false
	);

	const seriesByType: Record< VideoStatType, VideoSummaryData | null > = {
		views: viewsData,
		impressions: impressionsData,
		watch_time: watchTimeData,
		retention_rate: retentionData,
	};

	const summaryData = seriesByType[ statType ];

	// Normalizes a raw API date to its period bucket, so generated buckets and
	// API records use the same keys regardless of the API's date format.
	const bucketKey = ( date: string ) => moment( date ).startOf( period ).format( 'YYYY-MM-DD' );

	// The API only returns buckets from the video's first activity onwards, so
	// a young video yields one or two bars that the chart lays out poorly.
	// Zero-fill gaps and, for the day view, extend the window backwards to a
	// full page of bars, matching the designs.
	const zeroFilledData = useMemo( () => {
		const raw = summaryData?.data ?? [];
		if ( ! raw.length ) {
			return raw;
		}

		const valuesByBucket = new Map(
			raw.map( ( { period: date, value } ) => [ bucketKey( date ), value ] )
		);
		const end = moment( raw[ raw.length - 1 ].period ).startOf( period );
		let start = moment( raw[ 0 ].period ).startOf( period );
		if ( uploadDate ) {
			const uploadStart = moment( uploadDate ).startOf( period );
			if ( uploadStart.isValid() && uploadStart.isBefore( start ) ) {
				start = uploadStart;
			}
		}
		if ( period === 'day' ) {
			const minStart = end.clone().subtract( MAX_RECORDS_PER_DAY - 1, 'day' );
			if ( minStart.isBefore( start ) ) {
				start = minStart;
			}
		}
		const maxBuckets = 1000;
		if ( end.diff( start, period ) + 1 > maxBuckets ) {
			start = end.clone().subtract( maxBuckets - 1, period );
		}

		const buckets = [];
		for ( const cursor = start.clone(); ! cursor.isAfter( end ); cursor.add( 1, period ) ) {
			const key = cursor.format( 'YYYY-MM-DD' );
			buckets.push( { period: key, value: valuesByBucket.get( key ) ?? 0 } );
		}
		return buckets;
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [ summaryData, period, uploadDate, moment ] );

	const allRecords: ChartRecord[] = useMemo(
		() =>
			zeroFilledData.map( ( { period: date, value } ) => {
				const start = moment( date );
				switch ( period ) {
					case 'week':
						return {
							period: start.format( 'MMM D' ),
							periodLabel: `${ start.format( 'L' ) } - ${ moment( date )
								.add( 6, 'days' )
								.format( 'L' ) }`,
							startDate: date,
							value,
						};
					case 'month':
						return {
							period: start.format( 'MMM YYYY' ),
							periodLabel: start.format( 'MMMM YYYY' ),
							startDate: date,
							value,
						};
					case 'year':
						return {
							period: start.format( 'YYYY' ),
							periodLabel: start.format( 'YYYY' ),
							startDate: date,
							value,
						};
					default:
						return {
							period: start.format( 'MMM D' ),
							periodLabel: start.format( 'LL' ),
							startDate: date,
							value,
						};
				}
			} ),
		[ zeroFilledData, period, moment ]
	);

	const getPageRecords = ( pageNum: number ) => {
		if ( period !== 'day' ) {
			return allRecords;
		}
		const start = Math.max( allRecords.length - MAX_RECORDS_PER_DAY * pageNum, 0 );
		const end = Math.max( allRecords.length - MAX_RECORDS_PER_DAY * ( pageNum - 1 ), 0 );
		return allRecords.slice( start, end );
	};

	const chartData = getPageRecords( page );
	const selected =
		selectedRecord ?? ( chartData.length ? chartData[ chartData.length - 1 ] : null );

	// Metric totals are computed over the dates visible in the chart, so the
	// cards always agree with what the chart displays. Retention rate is not
	// summable, so it is averaged weighted by views.
	const visibleDates = useMemo(
		() => new Set( chartData.map( ( record ) => record.startDate ) ),
		[ chartData ]
	);

	const sumVisible = ( data: VideoSummaryData | null ) => {
		if ( ! data?.data ) {
			return null;
		}
		return data.data
			.filter( ( record ) => visibleDates.has( bucketKey( record.period ) ) )
			.reduce( ( total, record ) => total + record.value, 0 );
	};

	const retentionRate = useMemo( () => {
		if ( ! retentionData?.data || ! viewsData?.data ) {
			return null;
		}
		const viewsByDate = new Map(
			viewsData.data
				.filter( ( record ) => visibleDates.has( bucketKey( record.period ) ) )
				.map( ( record ) => [ bucketKey( record.period ), record.value ] )
		);
		let weightedTotal = 0;
		let viewsTotal = 0;
		for ( const record of retentionData.data ) {
			const key = bucketKey( record.period );
			if ( ! visibleDates.has( key ) ) {
				continue;
			}
			const views = viewsByDate.get( key ) ?? 0;
			weightedTotal += record.value * views;
			viewsTotal += views;
		}
		return viewsTotal > 0 ? weightedTotal / viewsTotal : null;
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [ retentionData, viewsData, visibleDates, period ] );

	const metricValues: VideoMetricValues = {
		views: sumVisible( viewsData ),
		impressions: sumVisible( impressionsData ),
		watch_time: sumVisible( watchTimeData ),
		retention_rate: retentionRate,
	};

	const selectPeriod = ( newPeriod: Period ) => () => {
		setPeriod( newPeriod );
		setSelectedRecord( null );
		setPage( 1 );
	};

	const selectStatType = ( newStatType: VideoStatType ) => {
		setStatType( newStatType );
		setSelectedRecord( null );
	};

	const handleArrows = ( { direction }: { direction: string } ) => {
		if ( ! chartData.length || ! selected ) {
			return;
		}

		const recordIndex = chartData.findIndex( ( record ) => record.period === selected.period );

		if ( direction === 'previous' ) {
			if ( recordIndex > 0 ) {
				setSelectedRecord( chartData[ recordIndex - 1 ] );
			} else {
				const previousPage = getPageRecords( page + 1 );
				if ( previousPage.length ) {
					setPage( page + 1 );
					setSelectedRecord( previousPage[ previousPage.length - 1 ] );
				}
			}
		} else if ( direction === 'next' ) {
			if ( recordIndex < chartData.length - 1 ) {
				setSelectedRecord( chartData[ recordIndex + 1 ] );
			} else if ( page > 1 ) {
				const nextPage = getPageRecords( page - 1 );
				setPage( page - 1 );
				setSelectedRecord( nextPage[ 0 ] );
			}
		}
	};

	const selectedIndex = selected
		? chartData.findIndex( ( record ) => record.period === selected.period )
		: -1;
	let disablePreviousArrow = false;
	let disableNextArrow = false;
	if ( period === 'day' && allRecords.length ) {
		const maxPages = Math.ceil( allRecords.length / MAX_RECORDS_PER_DAY );
		disablePreviousArrow = page >= maxPages && selectedIndex === 0;
		disableNextArrow = page === 1 && selectedIndex === chartData.length - 1;
	} else {
		disablePreviousArrow = selectedIndex <= 0;
		disableNextArrow = selectedIndex === chartData.length - 1;
	}

	const tabLabels: Record< VideoStatType, string > = {
		views: translate( 'Views', { textOnly: true } ),
		impressions: translate( 'Impressions', { textOnly: true } ),
		watch_time: translate( 'Hours watched', { textOnly: true } ),
		retention_rate: translate( 'Retention rate', { textOnly: true } ),
	};

	const periods: Array< { id: Period; label: string } > = [
		{ id: 'day', label: translate( 'Days', { textOnly: true } ) },
		{ id: 'week', label: translate( 'Weeks', { textOnly: true } ) },
		{ id: 'month', label: translate( 'Months', { textOnly: true } ) },
		{ id: 'year', label: translate( 'Years', { textOnly: true } ) },
	];

	return (
		<div
			className={ clsx( 'stats-video-summary', 'is-chart-tabs', {
				'is-period-year': period === 'year',
				'has-less-than-three-bars': chartData.length > 0 && chartData.length < 3,
			} ) }
		>
			{ siteId &&
				STAT_TYPES.map( ( type ) => (
					<QuerySiteStats
						key={ type }
						siteId={ siteId }
						statType="statsVideo"
						query={ queries[ type ] }
					/>
				) ) }

			<StatsPeriodHeader>
				<StatsPeriodNavigation
					showArrows
					onPeriodChange={ handleArrows }
					disablePreviousArrow={ disablePreviousArrow }
					disableNextArrow={ disableNextArrow }
					date={ null }
				>
					<DatePicker period={ period } date={ selected?.startDate } isShort />
				</StatsPeriodNavigation>
				<SegmentedControl primary>
					{ periods.map( ( { id, label } ) => (
						<SegmentedControl.Item
							key={ id }
							onClick={ selectPeriod( id ) }
							selected={ period === id }
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
