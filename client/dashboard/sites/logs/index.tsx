import {
	HostingFeatures,
	LogType,
	PHPLog,
	ServerLog,
	SiteActivityLog,
	SiteLogsParams,
	SiteLogsData,
	ActivityLogsData,
	ActivityLogParams,
} from '@automattic/api-core';
import {
	siteLogsQuery,
	siteBySlugQuery,
	siteSettingsQuery,
	siteActivityLogQuery,
} from '@automattic/api-queries';
import { useQuery, useSuspenseQuery, skipToken } from '@tanstack/react-query';
import { useRouter } from '@tanstack/react-router';
import { TabPanel, ToggleControl, Card, CardHeader, CardBody } from '@wordpress/components';
import { DataViews, View, Filter, Field } from '@wordpress/dataviews';
import { __ } from '@wordpress/i18n';
import { useMemo, useState, useRef, useEffect } from 'react';
import { useAnalytics } from '../../app/analytics';
import { useDateRange } from '../../app/hooks/use-date-range';
import { useLocale } from '../../app/locale';
import { siteRoute } from '../../app/router/sites';
import { DateRangePicker } from '../../components/date-range-picker';
import Notice from '../../components/notice';
import { PageHeader } from '../../components/page-header';
import PageLayout from '../../components/page-layout';
import HostingFeatureGatedWithCallout from '../hosting-feature-gated-with-callout';
import { useActions } from './dataviews/actions';
import { useFields } from './dataviews/fields';
import { getInitialFiltersFromSearch, getAllowedFields } from './dataviews/filters';
import { useView, toFilterParams } from './dataviews/views';
import { LogsDownloader } from './downloader';
import { getLogsCalloutProps } from './logs-callout';
import { buildTimeRangeInSeconds } from './utils';
import type { Action } from '@wordpress/dataviews';

import './style.scss';

// Helper types and functions
type LogsData = SiteLogsData | ActivityLogsData | undefined;

// Type guards
const isSiteLogsData = ( data: LogsData ): data is SiteLogsData => {
	return data != null && 'logs' in data && 'total_results' in data;
};

const isActivityLogData = ( data: LogsData ): data is ActivityLogsData => {
	return data != null && 'activityLogs' in data;
};

const LOG_TABS = [
	{ name: 'activity', title: __( 'Activity' ) },
	{ name: 'php', title: __( 'PHP errors' ) },
	{ name: 'server', title: __( 'Web server' ) },
];

function filtersSignature(
	filters: Filter[] | undefined,
	allowed: ReadonlyArray< string >
): string {
	return allowed
		.slice()
		.sort()
		.map( ( field ) => {
			const raw = filters?.find( ( filter ) => filter.field === field )?.value;
			const values = Array.isArray( raw ) ? ( raw as string[] ).slice().sort() : [];
			return `${ field }:${ values.slice().sort().join( ',' ) }`;
		} )
		.join( '|' );
}

function SiteLogs( { logType }: { logType: LogType } ) {
	const locale = useLocale();
	const { siteSlug } = siteRoute.useParams();
	const router = useRouter();
	const { recordTracksEvent } = useAnalytics();
	const search = router.state.location.search;

	const { data: site } = useSuspenseQuery( siteBySlugQuery( siteSlug ) );

	const siteId = site.ID;

	const { data } = useSuspenseQuery( {
		...siteSettingsQuery( siteId ),
		select: ( s ) => ( {
			gmtOffset: typeof s?.gmt_offset === 'number' ? s.gmt_offset : 0,
			timezoneString: s?.timezone_string || undefined,
		} ),
	} );

	const { gmtOffset, timezoneString } = data!;

	const [ autoRefresh, setAutoRefresh ] = useState( false );

	const [ view, setView ] = useView( {
		logType,
		initialFilters: getInitialFiltersFromSearch( logType, search ),
	} );

	const { dateRange, handleDateRangeChange } = useDateRange( {
		timezoneString,
		gmtOffset,
		autoRefresh,
	} );

	const { startSec, endSec } = useMemo(
		() => buildTimeRangeInSeconds( dateRange.start, dateRange.end, timezoneString, gmtOffset ),
		[ dateRange.start, dateRange.end, gmtOffset, timezoneString ]
	);

	const filter = useMemo( () => toFilterParams( { view, logType } ), [ view, logType ] );

	const siteLogQueryParams: SiteLogsParams | null =
		logType !== LogType.ACTIVITY
			? {
					logType: logType as LogType,
					start: startSec,
					end: endSec,
					filter,
					sortOrder: view.sort?.direction,
					pageSize: view.perPage,
			  }
			: null;
	const activityLogQueryParams: ActivityLogParams | null =
		logType === LogType.ACTIVITY
			? {
					sort_order: view.sort?.direction,
					number: view.perPage || 20,
					page: view.page,
			  }
			: null;

	// This keeps a per-page cursor cache - page 1 has no cursor.
	const cursorsRef = useRef< Map< number, string > >( new Map() );

	// For the current page, use its cursor (or null/undefined on page 1).
	const scrollId = cursorsRef.current.get( view.page ?? 1 ) ?? null;
	const isActivityLogType = logType === LogType.ACTIVITY;
	// For activity logs, we use a different query
	const shouldFetchRegularLogs = logType !== LogType.ACTIVITY && !! siteLogQueryParams;
	const { data: siteLogsData, isFetching: isFetchingLogs } = useQuery(
		shouldFetchRegularLogs && siteLogQueryParams
			? siteLogsQuery( siteId, siteLogQueryParams, scrollId )
			: { queryKey: [ 'disabled-logs' ], queryFn: skipToken }
	);

	const shouldFetchActivityLogs = isActivityLogType && !! activityLogQueryParams;
	const { data: activityLogData, isFetching: isFetchingActivity } = useQuery(
		shouldFetchActivityLogs
			? siteActivityLogQuery( siteId, activityLogQueryParams )
			: { queryKey: [ 'disabled-activity' ], queryFn: skipToken }
	);

	const siteLogs: LogsData = isActivityLogType ? activityLogData : siteLogsData;
	const isFetching = isActivityLogType ? isFetchingActivity : isFetchingLogs;

	useEffect( () => {
		if ( ! siteLogs || isActivityLogType ) {
			return;
		}
		const nextPage = ( view.page ?? 1 ) + 1;
		let id: string | undefined;

		if ( isSiteLogsData( siteLogs ) ) {
			id = siteLogs.scroll_id || undefined;
		}

		if ( id ) {
			cursorsRef.current.set( nextPage, id );
		} else {
			cursorsRef.current.delete( nextPage );
		}
	}, [ siteLogs, view.page, logType, isActivityLogType ] );

	const handleDateRangeChangeWrapper = ( next: { start: Date; end: Date } ) => {
		setAutoRefresh( false );
		handleDateRangeChange( next );

		// Reset pagination + cursors
		cursorsRef.current.clear();
		setView( ( value ) => ( { ...value, page: 1 } ) );
	};

	// Extract the data for memoization

	let siteLogsArray;
	if ( isSiteLogsData( siteLogs ) ) {
		siteLogsArray = siteLogs.logs;
	} else if ( isActivityLogData( siteLogs ) ) {
		siteLogsArray = siteLogs.activityLogs;
	} else {
		siteLogsArray = undefined;
	}
	const logs = useMemo( () => {
		const suffix = scrollId ? scrollId.slice( 0, 8 ) : `p${ view.page }`;

		const items = siteLogsArray ?? [];
		return items.map( ( log: PHPLog | ServerLog | SiteActivityLog, index: number ) => {
			if ( logType === LogType.ACTIVITY ) {
				const activity = log as SiteActivityLog;
				return {
					...activity,
					id: `${ activity.activity_id }|${ suffix }|${ String( index ) }`,
				};
			}
			if ( logType === LogType.PHP ) {
				const php = log as PHPLog;
				return {
					...php,
					id: `${ php.timestamp }|${ php.file }|${ String( php.line ) }|${ suffix }|${ String(
						index
					) }`,
				};
			}
			const server = log as ServerLog;
			return {
				...server,
				id: `${ String( server.timestamp ) }|${ server.request_type }|${ server.status }|${
					server.request_url
				}|${ server.user_ip }|${ suffix }|${ String( index ) }`,
			};
		} );
	}, [ scrollId, view.page, siteLogsArray, logType ] );

	const paginationInfo = isActivityLogData( siteLogs )
		? {
				totalItems: siteLogs.totalItems,
				totalPages: siteLogs.totalPages,
		  }
		: {
				totalItems: ( () => {
					return isSiteLogsData( siteLogs ) ? siteLogs.total_results : 0;
				} )(),
				totalPages: ( () => {
					const totalResults = isSiteLogsData( siteLogs ) ? siteLogs.total_results : 0;
					return totalResults && view.perPage ? Math.ceil( totalResults / view.perPage ) : 0;
				} )(),
		  };

	const handleTabChange = ( tab: LogType ) => {
		if ( tab === LogType.PHP ) {
			router.navigate( { to: `/sites/${ siteSlug }/logs/php` } );
		} else if ( tab === LogType.SERVER ) {
			router.navigate( { to: `/sites/${ siteSlug }/logs/server` } );
		} else if ( tab === LogType.ACTIVITY ) {
			router.navigate( { to: `/sites/${ siteSlug }/logs/activity` } );
		}
	};

	const fields = useFields(
		timezoneString ? { logType, timezoneString, gmtOffset } : { logType, gmtOffset }
	);

	const onChangeView = ( next: View ) => {
		// Disable auto-refresh when the user changes the page
		if ( autoRefresh && ( next.page ?? 1 ) !== ( view.page ?? 1 ) ) {
			setAutoRefresh( false );
		}

		const allowed = getAllowedFields( logType );

		const sourceFilters = ( next.filters ?? view.filters ?? [] ) as Filter[];

		// Track severity changes
		if ( logType === LogType.PHP ) {
			const oldSeverity =
				( view.filters ?? [] )
					.find( ( filter ) => filter.field === 'severity' )
					?.value?.slice()
					.sort()
					.toString() || '';
			const newSeverity =
				sourceFilters
					.find( ( filter ) => filter.field === 'severity' )
					?.value?.slice()
					.sort()
					.toString() || '';
			if ( newSeverity !== oldSeverity ) {
				recordTracksEvent( 'calypso_dashboard_site_logs_severity_filter', {
					severity: newSeverity,
					severity_user: newSeverity.includes( 'User' ),
					severity_warning: newSeverity.includes( 'Warning' ),
					severity_deprecated: newSeverity.includes( 'Deprecated' ),
					severity_fatal: newSeverity.includes( 'Fatal' ),
				} );
			}
		}

		// Detect filters/sort/perPage changes
		const datasetChanged =
			next.perPage !== view.perPage ||
			next.sort?.direction !== view.sort?.direction ||
			filtersSignature( sourceFilters, allowed ) !== filtersSignature( view.filters, allowed );

		// Sync allowed filters to URL using sourceFilters
		const url = new URL( window.location.href );
		const isEmpty = ( value?: string[] ) => ! value || value.length === 0;
		allowed.forEach( ( field ) => {
			const value =
				( sourceFilters.find( ( filter ) => filter.field === field )?.value as
					| string[]
					| undefined ) || [];
			if ( isEmpty( value ) ) {
				url.searchParams.delete( field );
			} else {
				url.searchParams.set( field, value.slice().sort().toString() );
			}
		} );
		window.history.replaceState( null, '', url.pathname + url.search );

		// Apply view with only allowed filters; reset page/cursors if dataset changed
		if ( datasetChanged ) {
			cursorsRef.current.clear();
			setView( {
				...next,
				page: 1,
				filters: sourceFilters.filter( ( filter: Filter ) => allowed.includes( filter.field ) ),
			} );
		} else {
			setView( {
				...next,
				filters: sourceFilters.filter( ( filter: Filter ) => allowed.includes( filter.field ) ),
			} );
		}
	};

	const handleAutoRefreshClick = ( isChecked: boolean ) => {
		setAutoRefresh( isChecked );
		recordTracksEvent( 'calypso_dashboard_site_logs_auto_refresh', { enabled: isChecked } );
	};

	const actions = useActions( { logType, isLoading: isFetching, gmtOffset, timezoneString } );

	const [ notice, setNotice ] = useState< {
		variant: 'success' | 'error';
		message: string;
	} | null >( null );

	// Simple header const to eliminate duplication
	const LogsHeader = (
		<>
			{ logType !== LogType.ACTIVITY && (
				<>
					<LogsDownloader
						siteId={ siteId }
						siteSlug={ site.slug }
						logType={ logType as LogType }
						startSec={ startSec }
						endSec={ endSec }
						filter={ filter }
						onSuccess={ ( message ) => setNotice( { variant: 'success', message } ) }
						onError={ ( message ) => setNotice( { variant: 'error', message } ) }
					/>
					<ToggleControl
						__nextHasNoMarginBottom
						label={ __( 'Auto-refresh' ) }
						checked={ autoRefresh }
						onChange={ handleAutoRefreshClick }
					/>
				</>
			) }
		</>
	);

	return (
		<PageLayout header={ <PageHeader title={ __( 'Logs' ) } /> }>
			{ notice && (
				<div style={ { marginBottom: 12 } }>
					<Notice variant={ notice.variant }>{ notice.message }</Notice>
				</div>
			) }

			<HostingFeatureGatedWithCallout
				site={ site }
				feature={ HostingFeatures.LOGS }
				asOverlay
				{ ...getLogsCalloutProps() }
			>
				<>
					{ logType !== LogType.ACTIVITY && (
						<DateRangePicker
							start={ dateRange.start }
							end={ dateRange.end }
							gmtOffset={ gmtOffset }
							timezoneString={ timezoneString }
							locale={ locale }
							onChange={ handleDateRangeChangeWrapper }
						/>
					) }
					<Card className="site-logs-card">
						<CardHeader style={ { paddingBottom: '0' } }>
							<TabPanel
								className="site-logs-tabs"
								activeClass="is-active"
								tabs={ LOG_TABS }
								onSelect={ ( tabName ) => {
									if (
										tabName === LogType.PHP ||
										tabName === LogType.SERVER ||
										tabName === LogType.ACTIVITY
									) {
										handleTabChange( tabName as LogType );
									}
								} }
								initialTabName={ logType }
							>
								{ () => null }
							</TabPanel>
						</CardHeader>
						<CardBody>
							{ ( () => {
								if ( logType === LogType.PHP ) {
									return (
										<DataViews< PHPLog >
											data={ logs as PHPLog[] }
											isLoading={ isFetching }
											paginationInfo={ paginationInfo }
											fields={ fields as Field< PHPLog >[] }
											view={ view }
											actions={ actions as Action< PHPLog >[] }
											search={ false }
											defaultLayouts={ { table: {} } }
											onChangeView={ onChangeView }
											header={ LogsHeader }
										/>
									);
								}

								if ( logType === LogType.ACTIVITY ) {
									return (
										<DataViews< SiteActivityLog >
											data={ logs as SiteActivityLog[] }
											isLoading={ isFetching }
											paginationInfo={ paginationInfo }
											fields={ fields as unknown as Field< SiteActivityLog >[] }
											view={ view }
											actions={ actions as unknown as Action< SiteActivityLog >[] }
											search={ false }
											defaultLayouts={ { table: {} } }
											onChangeView={ onChangeView }
											header={ LogsHeader }
										/>
									);
								}

								return (
									<DataViews< ServerLog >
										data={ logs as ServerLog[] }
										isLoading={ isFetching }
										paginationInfo={ paginationInfo }
										fields={ fields as Field< ServerLog >[] }
										view={ view }
										actions={ actions as Action< ServerLog >[] }
										search={ false }
										defaultLayouts={ { table: {} } }
										onChangeView={ onChangeView }
										header={ LogsHeader }
									/>
								);
							} )() }
						</CardBody>
					</Card>
				</>
			</HostingFeatureGatedWithCallout>
		</PageLayout>
	);
}

export default SiteLogs;
