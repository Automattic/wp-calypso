import { sprintf } from '@wordpress/i18n';
import { useI18n } from '@wordpress/react-i18n';
import { useReducer, useState, useEffect } from 'react';
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
import './style.scss';

const PAGE_SIZE = 10;

interface PaginationState {
	currentPageIndex: number;
	prevScrollIdStack: ( string | undefined )[];
	currentScrollId: string | undefined;
	nextScrollId: string | undefined | null;
}

const defaultPaginationState: PaginationState = {
	currentPageIndex: 0,
	prevScrollIdStack: [],
	currentScrollId: undefined,
	nextScrollId: undefined,
};

type PaginationAction =
	| { type: 'click'; newPageIndex: number }
	| { type: 'load'; nextScrollId: string | null };

function paginationReducer(
	state: PaginationState = defaultPaginationState,
	action: PaginationAction
) {
	const { currentPageIndex, prevScrollIdStack, currentScrollId, nextScrollId } = state;

	switch ( action.type ) {
		case 'load':
			return {
				...state,
				nextScrollId: action.nextScrollId,
			};

		case 'click':
			if ( action.newPageIndex < currentPageIndex && prevScrollIdStack.length > 0 ) {
				return {
					currentPageIndex: currentPageIndex - 1,
					prevScrollIdStack: prevScrollIdStack.slice( 0, -1 ),
					currentScrollId: prevScrollIdStack[ prevScrollIdStack.length - 1 ],
					nextScrollId: currentScrollId,
				};
			} else if ( action.newPageIndex > state.currentPageIndex && nextScrollId ) {
				return {
					currentPageIndex: currentPageIndex + 1,
					prevScrollIdStack: [ ...prevScrollIdStack, currentScrollId ],
					currentScrollId: nextScrollId,
					nextScrollId: undefined, // We don't know the next scroll ID until we've finished loading the next page
				};
			}

		default:
			return state;
	}
}

export function SiteLogs() {
	const { __ } = useI18n();
	const siteId = useSelector( getSelectedSiteId );
	const moment = useLocalizedMoment();

	const getDateRange = () => {
		const startTime = moment().subtract( 7, 'd' ).unix();
		const endTime = moment().unix();
		return { startTime, endTime };
	};

	const [ dateRange, setDateRange ] = useState( getDateRange() );

	const [ paginationState, pageinationDispatch ] = useReducer( ( s, a ) => {
		const newState = paginationReducer( s, a );
		console.log( newState );
		return newState;
	}, defaultPaginationState );
	const { currentPageIndex, currentScrollId } = paginationState;

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
		page_size: PAGE_SIZE,
		scroll_id: currentScrollId,
	} );

	useEffect( () => {
		if ( data ) {
			pageinationDispatch( { type: 'load', nextScrollId: data.scroll_id } );
		}
	}, [ data ] );

	const handleTabSelected = ( tabName: SiteLogsTab ) => {
		setLogType( tabName );
	};

	const handleRefresh = () => {
		setDateRange( getDateRange() );
	};

	const titleHeader = __( 'Site Logs' );

	const paginationText = data?.total_results
		? /* translators: Describes which log entries we're showing on the page: "start" and "end" represent the range of log entries currently displayed, "total" is the number of log entries there are overall; e.g. Showing 1–20 of 428 */
		  sprintf( __( 'Showing %(start)d\u2013%(end)d of %(total)d' ), {
				start: currentPageIndex * PAGE_SIZE + 1,
				end: currentPageIndex * PAGE_SIZE + data.logs.length,
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
								perPage={ PAGE_SIZE }
								total={ data.total_results }
								pageClick={ ( newPageNumber: number ) =>
									pageinationDispatch( { type: 'click', newPageIndex: newPageNumber - 1 } )
								}
							/>
						) }
					</>
				) }
			</SiteLogsTabPanel>
		</Main>
	);
}
