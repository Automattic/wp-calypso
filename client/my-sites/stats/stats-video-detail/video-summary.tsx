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

const MAX_RECORDS_PER_DAY = 30;

export default function VideoSummary( {
	postId,
	statType,
}: {
	postId: number;
	statType: string | null;
} ) {
	const translate = useTranslate();
	const moment = useLocalizedMoment();
	const siteId = useSelector( getSelectedSiteId );
	const [ period, setPeriod ] = useState< Period >( 'day' );
	const [ selectedRecord, setSelectedRecord ] = useState< ChartRecord | null >( null );
	const [ page, setPage ] = useState( 1 );

	const query = useMemo( () => ( { postId, statType, period } ), [ postId, statType, period ] );
	const summaryData = useSelector(
		( state ) =>
			getSiteStatsNormalizedData( state, siteId, 'statsVideo', query ) as VideoSummaryData | null
	);
	const isRequesting = useSelector( ( state ) =>
		siteId ? isRequestingSiteStatsForQuery( state, siteId, 'statsVideo', query ) : false
	);

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

	const selectPeriod = ( newPeriod: Period ) => () => {
		setPeriod( newPeriod );
		setSelectedRecord( null );
		setPage( 1 );
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

	let tabLabel = translate( 'Views' );
	if ( statType === 'impressions' ) {
		tabLabel = translate( 'Impressions' );
	} else if ( statType === 'watch_time' ) {
		tabLabel = translate( 'Hours Watched' );
	} else if ( statType === 'retention_rate' ) {
		tabLabel = translate( 'Retention Rate' );
	}

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
			{ siteId && <QuerySiteStats siteId={ siteId } statType="statsVideo" query={ query } /> }

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
				tabLabel={ tabLabel }
				type="video"
			/>
		</div>
	);
}
