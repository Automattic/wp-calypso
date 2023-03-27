import { sprintf } from '@wordpress/i18n';
import { useI18n } from '@wordpress/react-i18n';
import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import DocumentHead from 'calypso/components/data/document-head';
import FormattedHeader from 'calypso/components/formatted-header';
import { useLocalizedMoment } from 'calypso/components/localized-moment';
import Main from 'calypso/components/main';
import Pagination from 'calypso/components/pagination';
import { SiteLogsTab, useSiteLogsQuery } from 'calypso/data/hosting/use-site-logs-query';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import { SiteLogsTabPanel } from './components/site-logs-tab-panel';
import { SiteLogsTable } from './components/site-logs-table';
import { SiteLogsToolbar } from './components/site-logs-toolbar';
import { useLogPagination } from './hooks/use-log-pagination';
import './style.scss';

const DEFAULT_PAGE_SIZE = 10;

export function SiteLogs( { pageSize = DEFAULT_PAGE_SIZE }: { pageSize?: number } ) {
	const { __ } = useI18n();
	const siteId = useSelector( getSelectedSiteId );
	const moment = useLocalizedMoment();

	const getDateRange = () => {
		const startTime = moment().subtract( 7, 'd' ).unix();
		const endTime = moment().unix();
		return { startTime, endTime };
	};

	const [ dateRange, setDateRange ] = useState( getDateRange() );

	const { currentPageIndex, currentScrollId, handlePageClick, handlePageLoad } = useLogPagination();

	const [ logType, setLogType ] = useState< SiteLogsTab >( () => {
		const queryParam = new URL( window.location.href ).searchParams.get( 'log-type' );
		return (
			queryParam && [ 'php', 'web' ].includes( queryParam ) ? queryParam : 'php'
		) as SiteLogsTab;
	} );

	const { data } = useSiteLogsQuery( siteId, {
		logType,
		start: dateRange.startTime,
		end: dateRange.endTime,
		sort_order: 'desc',
		page_size: pageSize,
		scroll_id: currentScrollId,
	} );

	useEffect( () => {
		if ( data ) {
			handlePageLoad( { nextScrollId: data.scroll_id } );
		}
	}, [ data, handlePageLoad ] );

	const handleTabSelected = ( tabName: SiteLogsTab ) => {
		setLogType( tabName );
	};

	const handleRefresh = () => {
		setDateRange( getDateRange() );
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

	return (
		<Main fullWidthLayout className="site-logs">
			<DocumentHead title={ titleHeader } />
			<FormattedHeader
				brandFont
				headerText={ titleHeader }
				subHeaderText={ __( 'View server logs to troubleshoot or debug problems with your site.' ) }
				align="left"
				className="site-logs__formatted-header"
			/>

			<SiteLogsTabPanel selectedTab={ logType } onSelected={ handleTabSelected }>
				{ () => (
					<>
						<SiteLogsToolbar onRefresh={ handleRefresh } />
						<SiteLogsTable logs={ data?.logs } />
						{ paginationText && (
							<div className="site-logs__pagination-text">{ paginationText }</div>
						) }
						{ !! data?.total_results && (
							<Pagination
								page={ currentPageIndex + 1 }
								perPage={ pageSize }
								total={ data.total_results }
								pageClick={ ( newPageNumber: number ) => handlePageClick( newPageNumber - 1 ) }
							/>
						) }
					</>
				) }
			</SiteLogsTabPanel>
		</Main>
	);
}
