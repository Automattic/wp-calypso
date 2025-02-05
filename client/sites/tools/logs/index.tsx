import {
	Button,
	__experimentalToggleGroupControl as ToggleGroupControl,
	__experimentalToggleGroupControlOption as ToggleGroupControlOption,
} from '@wordpress/components';
import { DataViews } from '@wordpress/dataviews';
import { sprintf } from '@wordpress/i18n';
import { download } from '@wordpress/icons';
import { useI18n } from '@wordpress/react-i18n';
import { translate } from 'i18n-calypso';
import { useCallback, useEffect, useState } from 'react';
import QuerySiteSettings from 'calypso/components/data/query-site-settings';
import InlineSupportLink from 'calypso/components/inline-support-link';
import { useLocalizedMoment } from 'calypso/components/localized-moment';
import NavigationHeader from 'calypso/components/navigation-header';
import Pagination from 'calypso/components/pagination';
import { useSiteLogsQuery, FilterType, LogType } from 'calypso/data/hosting/use-site-logs-query';
import { useInterval } from 'calypso/lib/interval';
import { navigate } from 'calypso/lib/navigate';
import {
	getDateRangeQueryParam,
	updateDateRangeQueryParam,
	getFilterQueryParam,
	updateFilterQueryParam,
} from 'calypso/sites/tools/logs/components/filter-params';
import { SiteLogsHeader } from 'calypso/sites/tools/logs/components/site-logs-header';
import { SiteLogsTable } from 'calypso/sites/tools/logs/components/site-logs-table';
import { SiteLogsToolbar } from 'calypso/sites/tools/logs/components/site-logs-toolbar';
import { useSiteLogsDownloader } from 'calypso/sites/tools/logs/hooks/use-site-logs-downloader';
import { useDispatch, useSelector } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import { Skeleton } from './components/site-logs-table/skeleton';
import { DateTimePicker } from './components/site-logs-toolbar/date-time-picker';
import { useCurrentSiteGmtOffset } from './hooks/use-current-site-gmt-offset';
import useFields from './hooks/use-fields';
import type { View, ViewTable } from '@wordpress/dataviews';
import type { Moment } from 'moment';
import './style.scss';

const DEFAULT_PAGE_SIZE = 50;

export function buildFilterParam(
	logType: LogType,
	severity: string,
	requestType: string,
	requestStatus: string
): FilterType {
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
}

export const SiteLogs = ( {
	logType,
	pageSize = DEFAULT_PAGE_SIZE,
}: {
	logType: LogType;
	pageSize?: number;
} ) => {
	const { __ } = useI18n();
	const siteId = useSelector( getSelectedSiteId );
	const moment = useLocalizedMoment();
	const dispatch = useDispatch();

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

	const { data, isInitialLoading, isFetching } = useSiteLogsQuery( siteId, {
		logType,
		start: dateRange.startTime.unix(),
		end: dateRange.endTime.unix(),
		filter: buildFilterParam( logType, severity, requestType, requestStatus ),
		sortOrder: 'desc',
		pageSize,
		pageIndex: currentPageIndex,
	} );

	const [ latestLogType, setLatestLogType ] = useState< LogType | undefined | null >( null );
	useEffect( () => {
		if ( ! isFetching && logType !== latestLogType ) {
			setLatestLogType( logType );
			if ( latestLogType ) {
				setSeverity( '' );
				setRequestType( '' );
				setRequestStatus( '' );
			}
		}
	}, [ latestLogType, logType, isFetching ] );

	const handleAutoRefreshClick = ( isChecked: boolean ) => {
		if ( isChecked ) {
			setDateRange( getLatestDateRange() );
			updateDateRangeQueryParam( null );
			setCurrentPageIndex( 0 );
		} else {
			updateDateRangeQueryParam( dateRange );
		}

		dispatch( recordTracksEvent( 'calypso_site_logs_auto_refresh', { enabled: isChecked } ) );
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
		<div>
			<SiteLogsHeader
				endDateTime={ dateRange.endTime }
				logType={ logType }
				requestStatus={ requestStatus }
				requestType={ requestType }
				severity={ severity }
				startDateTime={ dateRange.startTime }
			/>

			<div className="site-logs-container">
				{ siteId && <QuerySiteSettings siteId={ siteId } /> }
				<SiteLogsToolbar
					onDateTimeChange={ handleDateTimeChange }
					onSeverityChange={ handleSeverityChange }
					onRequestTypeChange={ handleRequestTypeChange }
					onRequestStatusChange={ handleRequestStatusChange }
					onAutoRefreshChange={ handleAutoRefreshClick }
					logType={ logType }
					startDateTime={ dateRange.startTime }
					endDateTime={ dateRange.endTime }
					autoRefresh={ autoRefresh }
					severity={ severity }
					requestType={ requestType }
					requestStatus={ requestStatus }
				/>
				<SiteLogsTable
					logs={ data?.logs }
					isLoading={ isFetching }
					headerTitles={ headerTitles }
					logType={ logType }
					latestLogType={ latestLogType }
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
		</div>
	);
};

const getFilterValueFromView = ( view: View, fieldName: string ) =>
	view.filters?.filter( ( filter ) => filter.field === fieldName )[ 0 ]?.value || '';

const EMPTY_ARRAY: Array< any > = [];
const useDataLogs = ( {
	view,
	logType,
	dateRange,
}: {
	view: View;
	logType: LogType;
	dateRange: { startTime: Moment; endTime: Moment };
} ) => {
	const siteId = useSelector( getSelectedSiteId );
	const severity = getFilterValueFromView( view, 'severity' );
	const status = getFilterValueFromView( view, 'status' );
	const requestType = getFilterValueFromView( view, 'request_type' );

	const { data, isFetching } = useSiteLogsQuery( siteId, {
		logType,
		start: dateRange.startTime.unix(),
		end: dateRange.endTime.unix(),
		filter: buildFilterParam( logType, severity, requestType, status ),
		sortOrder: view.sort?.direction,
		pageSize: view.perPage,
		pageIndex: view.page,
	} );

	return {
		data: data?.logs ? data.logs : EMPTY_ARRAY,
		paginationInfo: {
			totalItems: data?.total_results || 0,
			totalPages:
				!! data?.total_results && !! view.perPage
					? Math.ceil( data.total_results / view.perPage )
					: 0,
		},
		isLoading: isFetching,
	};
};

const getVisibleFieldsForLogType = ( logType: LogType ) => {
	if ( logType === 'php' ) {
		return [ 'severity', 'timestamp', 'message' ];
	}
	return [ 'request_type', 'date', 'status', 'request_url' ];
};

const getSortFieldForLogType = ( logType: LogType ) => ( logType === 'php' ? 'timestamp' : 'date' );

export const SiteLogsDataViews = ( { logType }: { logType: LogType } ) => {
	// TODO:
	// - DataViews:
	//   - styling issues: spacing left/right
	// - Empty state after filtering should display DataViews (not the empty state)
	// - Address the "show more" interaction.
	// - Review existing code: track events, etc.
	// - Endpoint
	//   - Can filter by multiple values (e.g.: "severity is any: user, deprecated").
	//   - What can have more filters? kind (core, plugins), name (WP version, plugin name).
	// - Translations: translate vs __.
	//   - __ for field elements https://github.com/Automattic/wp-calypso/blob/update/logs-to-dataviews/client/sites/tools/logs/components/site-logs-table/index.tsx#L54
	//   - translate for field labels https://github.com/Automattic/wp-calypso/blob/update/logs-to-dataviews/client/sites/tools/logs/components/site-logs-toolbar/index.tsx#L82

	const { __ } = useI18n();

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
	const handleTimeRangeChange = ( newStart: Moment | null, newEnd: Moment | null ) => {
		if (
			( ! newStart && ! newEnd ) ||
			( dateRange.startTime.isSame( newStart ) && dateRange.endTime.isSame( newEnd ) )
		) {
			return;
		}

		// setIsMobileOpen( false ); // TODO
		let startTime = newStart || dateRange.startTime;
		let endTime = newEnd || dateRange.endTime;
		if ( ! startTime.isValid() || ! endTime.isValid() ) {
			const latest = getLatestDateRange();
			startTime = latest.startTime;
			endTime = latest.endTime;
		}

		setDateRange( { startTime, endTime } );
		// setAutoRefresh( false ); // TODO
		updateDateRangeQueryParam( { startTime, endTime } );
	};

	const [ view, setView ] = useState< View >( () => {
		return {
			type: 'table' as const,
			page: 1,
			perPage: 50,
			sort: {
				field: getSortFieldForLogType( logType ),
				direction: 'desc',
			},
			fields: getVisibleFieldsForLogType( logType ),
			layout: {
				styles: {
					request_url: {
						maxWidth: '300px',
					},
					http_referer: {
						maxWidth: '300px',
					},
					message: {
						maxWidth: '300px',
					},
					file: {
						maxWidth: '300px',
					},
				},
			},
		};
	} );
	const fields = useFields( { logType } );
	const { data, paginationInfo, isLoading } = useDataLogs( { view, logType, dateRange } );
	const onChangeView = ( newView: View ) =>
		setView(
			( oldView: View ) =>
				( {
					...oldView,
					...newView,
					type: 'table' as const,
					layout: ( oldView as ViewTable )?.layout,
				} ) as ViewTable
		);
	useEffect( () => {
		setView( ( view: View ) => ( {
			...view,
			sort: {
				field: getSortFieldForLogType( logType ),
				direction: view?.sort?.direction || 'desc',
			},
			fields: getVisibleFieldsForLogType( logType ),
		} ) );
	}, [ logType ] );

	const siteGmtOffset = useCurrentSiteGmtOffset();

	const { downloadLogs } = useSiteLogsDownloader( { roundDateRangeToWholeDays: false } );
	const onDownloadLogs = useCallback( () => {
		downloadLogs( {
			logType,
			startDateTime: dateRange.startTime,
			endDateTime: dateRange.endTime,
			filter: buildFilterParam(
				logType,
				getFilterValueFromView( view, 'severity' ),
				getFilterValueFromView( view, 'request_type' ),
				getFilterValueFromView( view, 'request_status' )
			),
		} );
	}, [ downloadLogs, logType, dateRange, view ] );

	return (
		<>
			<div className="site-logs-header">
				<NavigationHeader
					title={ translate( 'Logs' ) }
					subtitle={ translate(
						'View and download various server logs. {{link}}Learn more{{/link}}',
						{
							components: {
								link: (
									<InlineSupportLink supportContext="site-monitoring-logs" showIcon={ false } />
								),
							},
						}
					) }
				/>
				<div className="site-logs-toolbar">
					<label className="site-logs-toolbar__label">
						<span>{ translate( 'From' ) }</span>
						<DateTimePicker
							className="site-logs-toolbar__datepicker"
							id="from"
							value={ dateRange.startTime }
							onChange={ ( value ) => handleTimeRangeChange( value, null ) }
							gmtOffset={ siteGmtOffset }
							min={ moment.unix( 0 ) } // The UI goes weird when the unix timestamps go negative, so don't allow it
							max={ dateRange.endTime }
						/>
					</label>

					<label className="site-logs-toolbar__label">
						<span>{ translate( 'To' ) }</span>
						<DateTimePicker
							className="site-logs-toolbar__datepicker"
							id="to"
							value={ dateRange.endTime }
							onChange={ ( value ) => handleTimeRangeChange( null, value ) }
							gmtOffset={ siteGmtOffset }
							max={ moment() }
							min={ dateRange.startTime }
						/>
					</label>
					<label className="site-logs-toolbar__label site-logs-toolbar__label_toggle">
						<span>{ translate( 'Log type' ) }</span>
						<ToggleGroupControl
							className="site-logs-toolbar__toggle"
							hideLabelFromVision
							label=""
							onChange={ ( value ) => {
								navigate( window.location.pathname.replace( /\/[^/]+$/, '/' + value ) );
							} }
							value={ logType }
							__nextHasNoMarginBottom
						>
							<ToggleGroupControlOption
								className="site-logs-toolbar__toggle-option"
								label={ translate( 'PHP error', {
									textOnly: true,
								} ) }
								value="php"
							/>
							<ToggleGroupControlOption
								className="site-logs-toolbar__toggle-option"
								label={ translate( 'Web server', {
									textOnly: true,
								} ) }
								value="web"
							/>
						</ToggleGroupControl>
					</label>
				</div>
			</div>
			{ isLoading && <Skeleton className="site-logs-table-webserver__skeleton" /> }
			{ ! isLoading && data && data.length === 0 && (
				<>{ __( 'No log entries within this time range.' ) }</>
			) }
			{ ! isLoading && data && data.length > 0 && (
				<DataViews
					data={ data }
					paginationInfo={ paginationInfo }
					fields={ fields }
					view={ view }
					onChangeView={ onChangeView }
					search={ false }
					defaultLayouts={ { table: {} } }
					header={
						<Button
							size="compact"
							icon={ download }
							label="Download logs"
							onClick={ onDownloadLogs }
						/>
					}
				/>
			) }
		</>
	);
};
