import { LogType, PHPLog, ServerLog, SiteLogsParams } from '@automattic/api-core';
import { siteLogsQuery } from '@automattic/api-queries';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from '@tanstack/react-router';
import { ToggleControl } from '@wordpress/components';
import { useDispatch } from '@wordpress/data';
import { DataViews, View, Filter, Field } from '@wordpress/dataviews';
import { __ } from '@wordpress/i18n';
import { store as noticesStore } from '@wordpress/notices';
import { useMemo, useRef, useEffect } from 'react';
import { useAnalytics } from '../../../app/analytics';
import { LogsDownloader } from '../downloader';
import { buildTimeRangeInSeconds } from '../utils';
import { useActions } from './actions';
import { useFields } from './fields';
import { getInitialFiltersFromSearch, getAllowedFields } from './filters';
import { useView, toFilterParams } from './views';
import type { Site } from '@automattic/api-core';
import type { Action } from '@wordpress/dataviews';
import './style.scss';
import type { Dispatch, SetStateAction } from 'react';

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

export type SiteLogsDataViewsProps = {
	dateRange: { start: Date; end: Date };
	autoRefresh: boolean;
	setAutoRefresh: Dispatch< SetStateAction< boolean > >;
	autoRefreshDisabledReason?: string | null;
	onAutoRefreshRequest?: ( isChecked: boolean ) => boolean;
	dateRangeVersion?: number;
	gmtOffset: number;
	timezoneString: string | undefined;
	site: Site;
};

function SiteLogsDataViews( {
	logType,
	dateRange,
	dateRangeVersion,
	gmtOffset,
	timezoneString,
	autoRefresh,
	setAutoRefresh,
	autoRefreshDisabledReason,
	onAutoRefreshRequest,
	site,
}: SiteLogsDataViewsProps & { logType: typeof LogType.PHP | typeof LogType.SERVER } ) {
	const router = useRouter();
	const { recordTracksEvent } = useAnalytics();
	const { createErrorNotice, createSuccessNotice } = useDispatch( noticesStore );
	const search = router.state.location.search;

	const [ view, setView ] = useView( {
		logType,
		initialFilters: getInitialFiltersFromSearch( logType, search ),
	} );

	const { startSec, endSec } = useMemo(
		() => buildTimeRangeInSeconds( dateRange.start, dateRange.end, timezoneString, gmtOffset ),
		[ dateRange.start, dateRange.end, gmtOffset, timezoneString ]
	);

	const filter = useMemo( () => toFilterParams( { view, logType } ), [ view, logType ] );

	const params: SiteLogsParams = {
		logType,
		start: startSec,
		end: endSec,
		filter,
		sortOrder: view.sort?.direction,
		pageSize: view.perPage,
	};

	// This keeps a per-page cursor cache - page 1 has no cursor.
	const cursorsRef = useRef< Map< number, string > >( new Map() );

	// For the current page, use its cursor (or null/undefined on page 1).
	const scrollId = cursorsRef.current.get( view.page ?? 1 ) ?? null;

	const { data: siteLogs, isFetching } = useQuery( siteLogsQuery( site.ID, params, scrollId ) );

	useEffect( () => {
		if ( ! siteLogs ) {
			return;
		}
		const nextPage = ( view.page ?? 1 ) + 1;
		const id = siteLogs.scroll_id;

		if ( id ) {
			cursorsRef.current.set( nextPage, id );
		} else {
			cursorsRef.current.delete( nextPage );
		}
	}, [ siteLogs, view.page ] );

	useEffect( () => {
		setView( ( value ) => ( { ...value, page: 1 } ) );

		// Reset pagination + cursors
		cursorsRef.current.clear();
	}, [ dateRangeVersion, setView ] );

	const logs = useMemo( () => {
		const suffix = scrollId ? scrollId.slice( 0, 8 ) : `p${ view.page }`;
		const items = siteLogs?.logs ?? [];

		return items.map( ( log, index ) => {
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
	}, [ scrollId, view.page, siteLogs?.logs, logType ] );

	const paginationInfo = {
		totalItems: siteLogs?.total_results || 0,
		totalPages:
			!! siteLogs?.total_results && !! view.perPage
				? Math.ceil( siteLogs.total_results / view.perPage )
				: 0,
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
		if ( onAutoRefreshRequest && ! onAutoRefreshRequest( isChecked ) ) {
			return; // blocked by parent; notice already set
		}
		recordTracksEvent( 'calypso_dashboard_site_logs_auto_refresh', { enabled: isChecked } );
	};

	const actions = useActions( { logType, isLoading: isFetching, gmtOffset, timezoneString } );

	// Simple header const to eliminate duplication
	const LogsHeader = (
		<>
			<LogsDownloader
				siteId={ site.ID }
				siteSlug={ site.slug }
				logType={ logType }
				startSec={ startSec }
				endSec={ endSec }
				filter={ filter }
				onSuccess={ ( message ) => createSuccessNotice( message, { type: 'snackbar' } ) }
				onError={ ( message ) => createErrorNotice( message, { type: 'snackbar' } ) }
			/>
			<ToggleControl
				__nextHasNoMarginBottom
				label={ __( 'Auto-refresh' ) }
				checked={ autoRefresh }
				onChange={ handleAutoRefreshClick }
				disabled={ Boolean( autoRefreshDisabledReason ) }
			/>
		</>
	);

	return (
		<>
			{ logType === LogType.PHP ? (
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
			) : (
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
			) }
		</>
	);
}

export default SiteLogsDataViews;
