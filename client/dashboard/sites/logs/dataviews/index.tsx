import { LogType, PHPLog, ServerLog, SiteLogsParams } from '@automattic/api-core';
import { siteLogsInfiniteQuery } from '@automattic/api-queries';
import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from '@tanstack/react-router';
import { ToggleControl, Button } from '@wordpress/components';
import { throttle } from '@wordpress/compose';
import { useDispatch } from '@wordpress/data';
import { DataViews, View, Filter, Field } from '@wordpress/dataviews';
import { __ } from '@wordpress/i18n';
import { arrowUp } from '@wordpress/icons';
import { store as noticesStore } from '@wordpress/notices';
import { useMemo, useEffect, useCallback, useRef, useLayoutEffect, useState } from 'react';
import { useAnalytics } from '../../../app/analytics';
import { LogsDownloader } from '../downloader';
import {
	buildTimeRangeInSeconds,
	buildPhpLogsWithId,
	buildServerLogsWithId,
	type PhpLogWithId,
	type ServerLogWithId,
} from '../utils';
import { useActions } from './actions';
import { useFields } from './fields';
import { getInitialFiltersFromSearch, getAllowedFields, filtersSignature } from './filters';
import { syncFiltersSearchParams } from './url-sync';
import { useView, toFilterParams } from './views';
import type { Site } from '@automattic/api-core';
import type { Action } from '@wordpress/dataviews';
import './style.scss';
import type { Dispatch, SetStateAction } from 'react';

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

const DEFAULT_PER_PAGE = 50;

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
	const queryClient = useQueryClient();
	const { recordTracksEvent } = useAnalytics();
	const { createErrorNotice, createSuccessNotice } = useDispatch( noticesStore );
	const search = router.state.location.search;
	const rafIdRef = useRef< number | null >( null );
	const dataviewsRef = useRef< HTMLDivElement | null >( null );
	const [ showScrollTop, setShowScrollTop ] = useState( false );

	const [ view, setView ] = useView( {
		logType,
		initialFilters: getInitialFiltersFromSearch( logType, search ),
	} );

	// We want to parse 'from' and 'to' from the URL.
	const parseUrlSeconds = useMemo( () => {
		const searchParams = new URLSearchParams( search );

		const readSeconds = ( key: 'from' | 'to' ) => {
			const raw = searchParams.get( key );
			if ( ! raw ) {
				return null;
			}
			const number = Number.parseInt( raw, 10 );
			if ( ! Number.isFinite( number ) ) {
				return null;
			}
			// Enforce seconds-only here. The page-level normalizer will rewrite ms→s on mount.
			return number > 1e11 ? null : number;
		};

		const from = readSeconds( 'from' );
		const to = readSeconds( 'to' );
		return from != null && to != null ? { from, to } : null;
	}, [ search ] );

	const computed = useMemo(
		() => buildTimeRangeInSeconds( dateRange.start, dateRange.end, timezoneString, gmtOffset ),
		[ dateRange.start, dateRange.end, timezoneString, gmtOffset ]
	);

	const startSec = parseUrlSeconds ? parseUrlSeconds.from : computed.startSec;
	const endSec = parseUrlSeconds ? parseUrlSeconds.to : computed.endSec;

	// Sync URL when time or filters change. Guard against first render before filters hydrate.
	useEffect( () => {
		if ( typeof view.filters === 'undefined' ) {
			return;
		}
		const url = new URL( window.location.href );
		// Re-apply filters currently in view to the URL
		const allowed = getAllowedFields( logType );
		const sourceFilters = ( view.filters ?? [] ) as Filter[];
		syncFiltersSearchParams( url.searchParams, allowed, sourceFilters );
		// Always set canonical time params (seconds)
		url.searchParams.set( 'from', String( startSec ) );
		url.searchParams.set( 'to', String( endSec ) );
		window.history.replaceState( null, '', url.toString() );
	}, [ startSec, endSec, view.filters, logType, search ] );

	const filter = useMemo( () => toFilterParams( { view, logType } ), [ view, logType ] );

	const params: SiteLogsParams = {
		logType,
		start: startSec,
		end: endSec,
		filter,
		sortOrder: view.sort?.direction,
		pageSize: DEFAULT_PER_PAGE,
	};

	const { data, isFetching, isFetchingNextPage, fetchNextPage, hasNextPage } = useInfiniteQuery(
		siteLogsInfiniteQuery( site.ID, params )
	);

	const handleResize = useCallback( () => {
		if ( ! dataviewsRef.current ) {
			return;
		}

		if ( rafIdRef.current ) {
			cancelAnimationFrame( rafIdRef.current );
		}

		rafIdRef.current = requestAnimationFrame( () => {
			if ( ! dataviewsRef.current ) {
				return;
			}

			const { top } = dataviewsRef.current.getBoundingClientRect();
			const maxHeight = window.innerHeight - top - 32 - 1;
			dataviewsRef.current.style.maxHeight = `${ maxHeight }px`;
		} );
	}, [] );

	useEffect( () => {
		setView( ( value ) => ( { ...value, page: 1 } ) );
	}, [ dateRangeVersion, setView ] );

	useLayoutEffect( () => {
		dataviewsRef.current = document.querySelector< HTMLDivElement >( '.dataviews-wrapper' );
		if ( ! dataviewsRef.current ) {
			return;
		}

		handleResize();
		window.addEventListener( 'resize', handleResize );
		window.addEventListener( 'orientationchange', handleResize );

		return () => {
			window.removeEventListener( 'resize', handleResize );
			window.removeEventListener( 'orientationchange', handleResize );

			if ( rafIdRef.current ) {
				cancelAnimationFrame( rafIdRef.current );
			}
		};
	}, [ logType, handleResize ] );

	const phpLogs = useMemo< PhpLogWithId[] >( () => {
		if ( logType !== LogType.PHP ) {
			return [];
		}
		return buildPhpLogsWithId( ( data?.pages as Array< { logs?: PHPLog[] } > ) ?? [] );
	}, [ data?.pages, logType ] );

	const serverLogs = useMemo< ServerLogWithId[] >( () => {
		if ( logType !== LogType.SERVER ) {
			return [];
		}
		return buildServerLogsWithId( ( data?.pages as Array< { logs?: ServerLog[] } > ) ?? [] );
	}, [ data?.pages, logType ] );

	const fields = useFields( { logType, timezoneString, gmtOffset } );

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

		// Sync allowed filters to URL using sourceFilters and preserve from/to params
		const url = new URL( window.location.href );
		syncFiltersSearchParams( url.searchParams, allowed, sourceFilters );
		// Always keep canonical time range params
		url.searchParams.set( 'from', String( startSec ) );
		url.searchParams.set( 'to', String( endSec ) );
		window.history.replaceState( null, '', url.pathname + url.search );

		// Apply view with only allowed filters; reset page if dataset changed
		if ( datasetChanged ) {
			// Clear prior infinite data for old sort/filter so we don't show an empty state.
			queryClient.removeQueries( {
				queryKey: [ 'site', site.ID, 'logs', 'infinite' ],
				exact: false,
			} );
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

	const logs = logType === LogType.PHP ? phpLogs : serverLogs;

	const infiniteScrollHandler = useCallback( () => {
		if ( hasNextPage && ! isFetchingNextPage ) {
			fetchNextPage();
		}
	}, [ hasNextPage, isFetchingNextPage, fetchNextPage ] );

	useEffect( () => {
		if ( ! dataviewsRef.current ) {
			return;
		}

		const el = dataviewsRef.current;

		const handleScroll = throttle( () => {
			const scrollTop = el.scrollTop;
			const scrollHeight = el.scrollHeight;
			const clientHeight = el.clientHeight;

			setShowScrollTop( scrollTop > clientHeight * 2 );

			if ( scrollTop + clientHeight >= scrollHeight - 100 ) {
				infiniteScrollHandler();
			}
		}, 100 );

		el.addEventListener( 'scroll', handleScroll );
		return () => el.removeEventListener( 'scroll', handleScroll );
	}, [ infiniteScrollHandler ] );

	const paginationInfo = {
		totalItems: logs.length,
		totalPages: 1,
	};

	useEffect( () => {
		setView( ( currentView ) => ( {
			...currentView,
			perPage: Math.max( logs.length, currentView.perPage ?? DEFAULT_PER_PAGE ),
		} ) );
	}, [ logs.length, setView ] );

	return (
		<>
			{ logType === LogType.PHP ? (
				<DataViews< PHPLog >
					data={ phpLogs }
					isLoading={ isFetching }
					paginationInfo={ paginationInfo }
					fields={ fields as Field< PHPLog >[] }
					getItemId={ ( item ) => item.id }
					view={ view }
					actions={ actions as Action< PHPLog >[] }
					search={ false }
					defaultLayouts={ { table: {} } }
					onChangeView={ onChangeView }
					header={ LogsHeader }
				/>
			) : (
				<DataViews< ServerLog >
					data={ serverLogs }
					isLoading={ isFetching }
					paginationInfo={ paginationInfo }
					fields={ fields as Field< ServerLog >[] }
					getItemId={ ( item ) => item.id }
					view={ view }
					actions={ actions as Action< ServerLog >[] }
					search={ false }
					defaultLayouts={ { table: {} } }
					onChangeView={ onChangeView }
					header={ LogsHeader }
				/>
			) }
			{ showScrollTop && (
				<Button
					icon={ arrowUp }
					iconSize={ 24 }
					size="compact"
					className="site-logs-scroll-to-top"
					onClick={ () => dataviewsRef.current?.scrollTo( { top: 0, behavior: 'smooth' } ) }
				/>
			) }
		</>
	);
}

export default SiteLogsDataViews;
