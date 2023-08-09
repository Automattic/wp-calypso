import { ToggleControl } from '@wordpress/components';
import { sprintf } from '@wordpress/i18n';
import { useI18n } from '@wordpress/react-i18n';
import classnames from 'classnames';
import { useCallback, useState } from 'react';
import DocumentHead from 'calypso/components/data/document-head';
import QuerySiteSettings from 'calypso/components/data/query-site-settings';
import FormattedHeader from 'calypso/components/formatted-header';
import { useLocalizedMoment } from 'calypso/components/localized-moment';
import Main from 'calypso/components/main';
import Pagination from 'calypso/components/pagination';
import { SiteLogsTab, useSiteLogsQuery } from 'calypso/data/hosting/use-site-logs-query';
import { useInterval } from 'calypso/lib/interval';
import { useSelector } from 'calypso/state';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import { SiteLogsTable } from '../site-monitoring/components/site-logs-table';
import { SiteLogsToolbar } from '../site-monitoring/components/site-logs-toolbar';
import { SiteLogsTabPanel } from './components/site-logs-tab-panel';
import {
	getDateRangeQueryParam,
	getLogTypeQueryParam,
	updateDateRangeQueryParam,
} from './site-logs-filter-params';
import type { Moment } from 'moment';

import './style.scss';

const DEFAULT_PAGE_SIZE = 50;

export function SiteLogs( { pageSize = DEFAULT_PAGE_SIZE }: { pageSize?: number } ) {
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

	const [ logType, setLogType ] = useState< SiteLogsTab >( () => getLogTypeQueryParam() || 'php' );

	const { data, isInitialLoading, isFetching } = useSiteLogsQuery( siteId, {
		logType,
		start: dateRange.startTime.unix(),
		end: dateRange.endTime.unix(),
		sortOrder: 'desc',
		pageSize,
		pageIndex: currentPageIndex,
	} );

	const [ autoRefresh, setAutoRefresh ] = useState( () => {
		const { startTime, endTime } = getDateRangeQueryParam( moment );
		return ! startTime && ! endTime;
	} );

	const autoRefreshCallback = useCallback( () => {
		setDateRange( getLatestDateRange() );
		setCurrentPageIndex( 0 );
	}, [ getLatestDateRange ] );
	useInterval( autoRefreshCallback, autoRefresh && 10 * 1000 );

	const handleTabSelected = ( tabName: SiteLogsTab ) => {
		setLogType( tabName );
		setCurrentPageIndex( 0 );
	};

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

	const titleHeader = __( 'Site Logs' );

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

	return (
		<Main fullWidthLayout className={ classnames( 'site-logs', { 'is-loading': isFetching } ) }>
			<DocumentHead title={ titleHeader } />
			{ siteId && <QuerySiteSettings siteId={ siteId } /> }
			<FormattedHeader
				brandFont
				headerText={ titleHeader }
				subHeaderText={ __( 'View server logs to troubleshoot or debug problems with your site.' ) }
				align="left"
				className="site-logs__formatted-header"
			>
				<ToggleControl
					className="site-logs__auto-refresh"
					label={ __( 'Auto-refresh' ) }
					checked={ autoRefresh }
					onChange={ handleAutoRefreshClick }
				/>
			</FormattedHeader>

			<SiteLogsTabPanel selectedTab={ logType } onSelected={ handleTabSelected }>
				{ () => (
					<>
						<SiteLogsToolbar
							logType={ logType }
							startDateTime={ dateRange.startTime }
							endDateTime={ dateRange.endTime }
							onDateTimeChange={ handleDateTimeChange }
						/>
						<SiteLogsTable logs={ data?.logs } logType={ logType } isLoading={ isFetching } />
						{ paginationText && (
							<div className="site-logs__pagination-text">{ paginationText }</div>
						) }
						{ !! data?.total_results && (
							<div className="site-logs__pagination-click-guard">
								<Pagination
									page={ currentPageIndex + 1 }
									perPage={ pageSize }
									total={ data.total_results }
									pageClick={ handlePageClick }
								/>
							</div>
						) }
					</>
				) }
			</SiteLogsTabPanel>
		</Main>
	);
}
