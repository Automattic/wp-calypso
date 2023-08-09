import { sprintf } from '@wordpress/i18n';
import { useI18n } from '@wordpress/react-i18n';
import { useCallback, useState } from 'react';
import { useLocalizedMoment } from 'calypso/components/localized-moment';
import Pagination from 'calypso/components/pagination';
import { useSiteLogsQuery } from 'calypso/data/hosting/use-site-logs-query';
import { useSelector } from 'calypso/state';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import { SiteLogsTable } from './components/site-logs-table';
import { SiteLogsToolbar } from './components/site-logs-toolbar';
import { getDateRangeQueryParam, updateDateRangeQueryParam } from './site-monitoring-filter-params';
import type { Moment } from 'moment';

type LogType = 'php' | 'web';

const DEFAULT_PAGE_SIZE = 50;

export const LogsTab = ( {
	logType,
	pageSize = DEFAULT_PAGE_SIZE,
}: {
	logType: LogType;
	pageSize?: number;
} ) => {
	const { __ } = useI18n();
	const siteId = useSelector( getSelectedSiteId );
	const moment = useLocalizedMoment();

	const getLatestDateRange = useCallback( () => {
		const startTime = moment().subtract( 7, 'd' );
		const endTime = moment();
		return { startTime, endTime };
	}, [ moment ] );

	const [ dateRange, setDateRange ] = useState( () => {
		const latest = getLatestDateRange();
		const dateRangeQuery = getDateRangeQueryParam( moment );
		return {
			startTime: dateRangeQuery.startTime || latest.startTime,
			endTime: dateRangeQuery.endTime || latest.endTime,
		};
	} );

	const [ currentPageIndex, setCurrentPageIndex ] = useState( 0 );

	const { data, isInitialLoading, isFetching } = useSiteLogsQuery( siteId, {
		logType,
		start: dateRange.startTime.unix(),
		end: dateRange.endTime.unix(),
		sortOrder: 'desc',
		pageSize,
		pageIndex: currentPageIndex,
	} );

	const handlePageClick = ( nextPageNumber: number ) => {
		if ( isInitialLoading ) {
			return;
		}

		const nextPageIndex = nextPageNumber - 1;
		if ( nextPageIndex < currentPageIndex && currentPageIndex > 0 ) {
			setCurrentPageIndex( currentPageIndex - 1 );
		} else if (
			nextPageIndex > currentPageIndex &&
			( currentPageIndex + 1 ) * pageSize < ( data?.total_results ?? 0 )
		) {
			setCurrentPageIndex( currentPageIndex + 1 );
		}
	};

	const paginationText =
		data?.total_results && data.total_results > pageSize
			? /* translators: Describes which log entries we're showing on the page: "start" and "end" represent the range of log entries currently displayed, "total" is the number of log entries there are overall; e.g. Showing 1–20 of 428 */
			  sprintf( __( 'Showing %(start)d\u2013%(end)d of %(total)d' ), {
					start: currentPageIndex * pageSize + 1,
					end: currentPageIndex * pageSize + data.logs.length,
					total: data.total_results,
			  } )
			: null;

	const handleDateTimeChange = ( startTime: Moment, endTime: Moment ) => {
		// check for "clear" pressed
		if ( ! startTime.isValid() || ! endTime.isValid() ) {
			const latest = getLatestDateRange();
			startTime = latest.startTime;
			endTime = latest.endTime;
		}

		setDateRange( { startTime, endTime } );
		updateDateRangeQueryParam( { startTime, endTime } );
	};

	return (
		<>
			<SiteLogsToolbar
				logType={ logType }
				startDateTime={ dateRange.startTime }
				endDateTime={ dateRange.endTime }
				onDateTimeChange={ handleDateTimeChange }
			/>
			<SiteLogsTable logs={ data?.logs } logType={ logType } isLoading={ isFetching } />
			{ paginationText && (
				<div className="site-monitoring__pagination-text">{ paginationText }</div>
			) }
			{ !! data?.total_results && (
				<div className="site-monitoring__pagination-click-guard">
					<Pagination
						page={ currentPageIndex + 1 }
						perPage={ pageSize }
						total={ data.total_results }
						pageClick={ handlePageClick }
					/>
				</div>
			) }
		</>
	);
};
