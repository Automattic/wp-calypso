import { LogType, PHPLog, ServerLog, SiteLogsParams } from '@automattic/api-core';
import { siteLogsInfiniteQuery } from '@automattic/api-queries';
import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from '@tanstack/react-router';
import { ToggleControl, Button, Spinner } from '@wordpress/components';
import { useDispatch } from '@wordpress/data';
import { View, Filter, Field } from '@wordpress/dataviews';
import { createInterpolateElement } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { arrowUp } from '@wordpress/icons';
import { store as noticesStore } from '@wordpress/notices';
import fastDeepEqual from 'fast-deep-equal/es6';
import { useMemo, useEffect, useCallback, useRef, useLayoutEffect, useState } from 'react';
import { useAnalytics } from '../../../app/analytics';
import { usePersistentView } from '../../../app/hooks/use-persistent-view';
import { PerformanceTrackerStop } from '../../../app/performance-tracking';
import { DataViews, DataViewsEmptyStateLayout } from '../../../components/dataviews';
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
import {
	DEFAULT_PER_PAGE,
	DEFAULT_PHP_LOGS_VIEW,
	DEFAULT_SERVER_LOGS_VIEW,
	toFilterParams,
} from './views';
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
	const {
		view: persistedView,
		updateView,
		resetView,
	} = usePersistentView( {
		slug: `site-logs-${ logType }`,
		defaultView: logType === LogType.PHP ? DEFAULT_PHP_LOGS_VIEW : DEFAULT_SERVER_LOGS_VIEW,
		queryParams: search,
		queryParamFilterFields: logType === LogType.PHP ? [ 'severity' ] : [],
	} );

	// Where DataViews' infinite scroll has advanced the window to. Deliberately
	// not persisted, so it lives here rather than in the persisted view.
	const [ startPosition, setStartPosition ] = useState( 1 );

	// Infinite scroll is how this screen works, not a user preference, so force it
	// on rather than inheriting it from a view persisted before it existed.
	const view = useMemo(
		() => ( { ...persistedView, infiniteScrollEnabled: true, startPosition } ),
		[ persistedView, startPosition ]
	);

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

	// Sync URL when time change.
	useEffect( () => {
		const url = new URL( window.location.href );
		// Always set canonical time params (seconds)
		url.searchParams.set( 'from', String( startSec ) );
		url.searchParams.set( 'to', String( endSec ) );
		window.history.replaceState( null, '', url.toString() );
	}, [ startSec, endSec, logType ] );

	// Derived from the persisted view, not the merged one, so that advancing
	// `startPosition` doesn't churn the query params.
	const filter = useMemo(
		() => toFilterParams( { view: persistedView, logType } ),
		[ persistedView, logType ]
	);
	const sortOrder = persistedView.sort?.direction;

	const params: SiteLogsParams = {
		logType,
		start: startSec,
		end: endSec,
		filter,
		sortOrder,
		pageSize: DEFAULT_PER_PAGE,
	};

	// The loaded pages restart whenever the query params change (a new date range,
	// filter, or sort — including the range shifting under auto-refresh), so the
	// window goes back to the beginning with them. Keyed by value: the view object
	// identity changes on every render, so `filter` can't be a dependency.
	const datasetKey = `${ startSec }|${ endSec }|${ sortOrder }|${ JSON.stringify( filter ) }`;
	useEffect( () => {
		setStartPosition( 1 );
	}, [ datasetKey ] );

	const {
		data,
		isFetching,
		isFetchingNextPage,
		fetchNextPage,
		hasNextPage,
		isLoading: isLoadingLogQuery,
	} = useInfiniteQuery( siteLogsInfiniteQuery( site.ID, params ) );

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
		if ( ! view.page || view.page === 1 ) {
			return;
		}
		updateView( { ...view, page: 1 } );
		// eslint-disable-next-line react-hooks/exhaustive-deps -- reset page only when dateRange changes
	}, [ dateRangeVersion ] );

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
		// Re-runs once the first page arrives: the wrapper doesn't exist while the
		// loading placeholder shows, and bounding it is what makes the table scroll.
	}, [ logType, handleResize, isLoadingLogQuery ] );

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

	const logs = logType === LogType.PHP ? phpLogs : serverLogs;
	const perPage = view.perPage ?? DEFAULT_PER_PAGE;

	// With infinite scroll, DataViews expects the current window rather than
	// everything loaded so far; it reassembles the full list itself.
	const windowStart = startPosition - 1;
	const visiblePhpLogs = useMemo(
		() => phpLogs.slice( windowStart, windowStart + perPage ),
		[ phpLogs, windowStart, perPage ]
	);
	const visibleServerLogs = useMemo(
		() => serverLogs.slice( windowStart, windowStart + perPage ),
		[ serverLogs, windowStart, perPage ]
	);

	const fields = useFields( { logType, timezoneString, gmtOffset } );

	const onChangeView = ( next: View ) => {
		// Disable auto-refresh when the user changes the page
		if ( autoRefresh && ( next.page ?? 1 ) !== ( view.page ?? 1 ) ) {
			setAutoRefresh( false );
		}

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

		// Detect filters/sort/perPage changes. Normalize the filters, otherwise an
		// unfiltered view compares `[]` against `undefined` and reports a change on
		// every call — including each time infinite scroll advances the window.
		const datasetChanged =
			next.perPage !== view.perPage ||
			next.sort?.direction !== view.sort?.direction ||
			! fastDeepEqual( sourceFilters, view.filters ?? [] );

		const url = new URL( window.location.href );
		// Always keep canonical time range params
		url.searchParams.set( 'from', String( startSec ) );
		url.searchParams.set( 'to', String( endSec ) );
		window.history.replaceState( null, '', url.pathname + url.search );

		if ( datasetChanged ) {
			// Clear prior infinite data for old sort/filter so we don't show an empty state.
			queryClient.removeQueries( {
				queryKey: [ 'site', site.ID, 'logs', 'infinite' ],
				exact: false,
			} );
			setStartPosition( 1 );
			updateView( { ...next, page: 1 } );
			return;
		}

		// DataViews drives infinite scroll by advancing `startPosition`. Fetch the
		// next page once the window nears the end of what has been loaded.
		const nextStartPosition = next.startPosition ?? 1;
		if ( nextStartPosition !== startPosition ) {
			setStartPosition( nextStartPosition );

			if ( nextStartPosition + perPage > logs.length && hasNextPage && ! isFetchingNextPage ) {
				fetchNextPage();
			}
		}

		updateView( next );
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

	// DataViews advances its window only while `totalItems` stays ahead of it, so
	// report an optimistic total while more pages remain.
	const paginationInfo = {
		totalItems: hasNextPage ? logs.length + perPage : logs.length,
		totalPages: 1,
	};

	const emptyState = (
		<DataViewsEmptyStateLayout
			isBorderless
			title={ __( 'No results' ) }
			description={
				logType === LogType.PHP
					? createInterpolateElement(
							__(
								'The custom <wpDebugLog>WP_DEBUG_LOG</wpDebugLog> or <errorLog>error_log</errorLog> paths aren’t shown here.'
							),
							{
								wpDebugLog: <code />,
								errorLog: <code />,
							}
					  )
					: __( 'No server requests were logged for the selected time range.' )
			}
		/>
	);

	// DataViews binds its infinite-scroll listener to the scroll container in an
	// effect that gives up when the container isn't there yet, and never retries.
	// The container only renders once DataViews has rows, so mounting it mid-fetch
	// permanently loses the listener. Wait for the first page instead.
	if ( isLoadingLogQuery ) {
		return (
			<div className="site-logs-loading">
				<Spinner />
			</div>
		);
	}

	return (
		<>
			{ logType === LogType.PHP ? (
				<DataViews< PHPLog >
					data={ visiblePhpLogs }
					isLoading={ isFetchingNextPage }
					paginationInfo={ paginationInfo }
					fields={ fields as Field< PHPLog >[] }
					getItemId={ ( item ) => item.id }
					view={ view }
					actions={ actions as Action< PHPLog >[] }
					search={ false }
					defaultLayouts={ { table: {} } }
					onChangeView={ onChangeView }
					onReset={ resetView }
					header={ LogsHeader }
					empty={ emptyState }
				/>
			) : (
				<DataViews< ServerLog >
					data={ visibleServerLogs }
					isLoading={ isFetchingNextPage }
					paginationInfo={ paginationInfo }
					fields={ fields as Field< ServerLog >[] }
					getItemId={ ( item ) => item.id }
					view={ view }
					actions={ actions as Action< ServerLog >[] }
					search={ false }
					defaultLayouts={ { table: {} } }
					onChangeView={ onChangeView }
					onReset={ resetView }
					header={ LogsHeader }
					empty={ emptyState }
				/>
			) }
			{ startPosition > 1 && (
				<Button
					icon={ arrowUp }
					iconSize={ 24 }
					size="compact"
					className="site-logs-scroll-to-top"
					onClick={ () => {
						setStartPosition( 1 );
						dataviewsRef.current
							?.querySelector( '.dataviews-layout__container' )
							?.scrollTo( { top: 0, behavior: 'smooth' } );
					} }
				/>
			) }
			{ ! isLoadingLogQuery && <PerformanceTrackerStop /> }
		</>
	);
}

export default SiteLogsDataViews;
