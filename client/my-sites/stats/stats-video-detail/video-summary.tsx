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
}: {
	postId: number;
	initialStatType: string | null;
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

	const allRecords: ChartRecord[] = useMemo(
		() =>
			( summaryData?.data ?? [] ).map( ( { period: date, value } ) => {
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
		[ summaryData, period, moment ]
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
			.filter( ( record ) => visibleDates.has( record.period ) )
			.reduce( ( total, record ) => total + record.value, 0 );
	};

	const retentionRate = useMemo( () => {
		if ( ! retentionData?.data || ! viewsData?.data ) {
			return null;
		}
		const viewsByDate = new Map(
			viewsData.data
				.filter( ( record ) => visibleDates.has( record.period ) )
				.map( ( record ) => [ record.period, record.value ] )
		);
		let weightedTotal = 0;
		let viewsTotal = 0;
		for ( const record of retentionData.data ) {
			if ( ! visibleDates.has( record.period ) ) {
				continue;
			}
			const views = viewsByDate.get( record.period ) ?? 0;
			weightedTotal += record.value * views;
			viewsTotal += views;
		}
		return viewsTotal > 0 ? weightedTotal / viewsTotal : null;
	}, [ retentionData, viewsData, visibleDates ] );

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
