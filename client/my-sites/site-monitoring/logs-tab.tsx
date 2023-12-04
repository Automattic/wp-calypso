import { ToggleControl } from '@wordpress/components';
import { sprintf } from '@wordpress/i18n';
import { useI18n } from '@wordpress/react-i18n';
import { useCallback, useState } from 'react';
import { useLocalizedMoment } from 'calypso/components/localized-moment';
import Pagination from 'calypso/components/pagination';
import { useSiteLogsQuery, FilterType } from 'calypso/data/hosting/use-site-logs-query';
import { useInterval } from 'calypso/lib/interval';
import { useSelector } from 'calypso/state';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import { SiteLogsTable } from './components/site-logs-table';
import { SiteLogsToolbar } from './components/site-logs-toolbar';
import {
	getDateRangeQueryParam,
	updateDateRangeQueryParam,
	getFilterQueryParam,
	updateFilterQueryParam,
} from './site-monitoring-filter-params';
import type { Moment } from 'moment';

export type LogType = 'php' | 'web';

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

	const [ autoRefresh, setAutoRefresh ] = useState( false );

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

	const [ severity, setSeverity ] = useState( () => {
		return getFilterQueryParam( 'severity' ) || '';
	} );

	const [ requestType, setRequestType ] = useState( () => {
		return getFilterQueryParam( 'request_type' ) || '';
	} );

	const [ requestStatus, setRequestStatus ] = useState( () => {
		return getFilterQueryParam( 'request_status' ) || '';
	} );

	const [ currentPageIndex, setCurrentPageIndex ] = useState( 0 );

	const autoRefreshCallback = useCallback( () => {
		setDateRange( getLatestDateRange() );
		setCurrentPageIndex( 0 );
	}, [ getLatestDateRange ] );
	useInterval( autoRefreshCallback, autoRefresh && 10 * 1000 );

	const buildFilterParam = (
		logType: string,
		severity: string,
		requestType: string,
		requestStatus: string
	) => {
		const filters: FilterType = {};

		if ( logType === 'php' ) {
			if ( severity ) {
				filters.severity = [ severity ];
			}
		}

		if ( logType === 'web' ) {
			if ( requestType ) {
				filters.request_type = [ requestType ];
			}
			if ( requestStatus ) {
				filters.status = [ requestStatus ];
			}
		}

		return filters;
	};

	const { data, isInitialLoading, isFetching } = useSiteLogsQuery( siteId, {
		logType,
		start: dateRange.startTime.unix(),
		end: dateRange.endTime.unix(),
		filter: buildFilterParam( logType, severity, requestType, requestStatus ),
		sortOrder: 'desc',
		pageSize,
		pageIndex: currentPageIndex,
	} );

	const handleAutoRefreshClick = ( isChecked: boolean ) => {
		if ( isChecked ) {
			setDateRange( getLatestDateRange() );
			updateDateRangeQueryParam( null );
			setCurrentPageIndex( 0 );
		} else {
			updateDateRangeQueryParam( dateRange );
		}

		setAutoRefresh( isChecked );
	};

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

		setAutoRefresh( false );
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
		setAutoRefresh( false );
		updateDateRangeQueryParam( { startTime, endTime } );
	};

	const handleSeverityChange = ( severity: string ) => {
		setSeverity( severity );
		setAutoRefresh( false );
		updateFilterQueryParam( 'severity', severity );
	};

	const handleRequestTypeChange = ( requestType: string ) => {
		setRequestType( requestType );
		setAutoRefresh( false );
		updateFilterQueryParam( 'request_type', requestType );
	};

	const handleRequestStatusChange = ( requestStatus: string ) => {
		setRequestStatus( requestStatus );
		setAutoRefresh( false );
		updateFilterQueryParam( 'request_status', requestStatus );
	};

	const headerTitles =
		logType === 'php'
			? [ 'severity', 'timestamp', 'message' ]
			: [ 'request_type', 'date', 'status', 'request_url' ];

	return (
		<div className="site-logs-container">
			<SiteLogsToolbar
				logType={ logType }
				startDateTime={ dateRange.startTime }
				endDateTime={ dateRange.endTime }
				onDateTimeChange={ handleDateTimeChange }
				onSeverityChange={ handleSeverityChange }
				onRequestTypeChange={ handleRequestTypeChange }
				onRequestStatusChange={ handleRequestStatusChange }
				severity={ severity }
				requestType={ requestType }
				requestStatus={ requestStatus }
			>
				<ToggleControl
					className="site-logs__auto-refresh"
					label={ __( 'Auto-refresh' ) }
					checked={ autoRefresh }
					onChange={ handleAutoRefreshClick }
				/>
			</SiteLogsToolbar>
			<SiteLogsTable
				logs={ data?.logs }
				isLoading={ isFetching }
				headerTitles={ headerTitles }
				logType={ logType }
			/>
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
		</div>
	);
};
