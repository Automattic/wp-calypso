import { LogType, PHPLog, ServerLog, SiteLogsParams } from '@automattic/api-core';
import { siteLogsInfiniteQuery } from '@automattic/api-queries';
import { useInfiniteQuery } from '@tanstack/react-query';
import { useRouter } from '@tanstack/react-router';
import {
	ToggleControl,
	Spinner,
	__experimentalVStack as VStack,
	__experimentalHStack as HStack,
	__experimentalSpacer as Spacer,
} from '@wordpress/components';
import { useDispatch } from '@wordpress/data';
import { DataViews, View, Filter, Field } from '@wordpress/dataviews';
import { __ } from '@wordpress/i18n';
import { store as noticesStore } from '@wordpress/notices';
import { useMemo, useEffect, useCallback, useRef } from 'react';
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
	const loadMoreRef = useRef< HTMLDivElement | null >( null );

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

	const { data, isLoading, isFetching, isFetchingNextPage, fetchNextPage, hasNextPage } =
		useInfiniteQuery( {
			...siteLogsInfiniteQuery( site.ID, params ),
		} );

	useEffect( () => {
		setView( ( value ) => ( { ...value, page: 1 } ) );
	}, [ dateRangeVersion, setView ] );

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

	const currentPage = view.page ?? 1;
	const perPage = view.perPage ?? 50;
	const displayedPhpLogs = useMemo(
		() => phpLogs.slice( 0, currentPage * perPage ),
		[ phpLogs, currentPage, perPage ]
	);
	const displayedServerLogs = useMemo(
		() => serverLogs.slice( 0, currentPage * perPage ),
		[ serverLogs, currentPage, perPage ]
	);

	const infiniteScrollHandler = useCallback( () => {
		// Reveal what we already have loaded
		const totalLoaded = logType === LogType.PHP ? phpLogs.length : serverLogs.length;
		const displayedCount =
			logType === LogType.PHP ? displayedPhpLogs.length : displayedServerLogs.length;
		if ( displayedCount < totalLoaded ) {
			setView( ( prev ) => ( { ...prev, page: ( prev.page ?? 1 ) + 1 } ) );
		}

		// Prefetch next page early when we're close to exhausting loaded items
		const remainingLoaded =
			( logType === LogType.PHP ? phpLogs.length : serverLogs.length ) - currentPage * perPage;
		const shouldPrefetch = hasNextPage && ! isFetchingNextPage && remainingLoaded <= perPage;
		if ( shouldPrefetch ) {
			if ( autoRefresh ) {
				setAutoRefresh( false );
			}
			fetchNextPage();
		}
	}, [
		displayedPhpLogs.length,
		displayedServerLogs.length,
		phpLogs.length,
		serverLogs.length,
		logType,
		currentPage,
		perPage,
		hasNextPage,
		isFetchingNextPage,
		fetchNextPage,
		autoRefresh,
		setAutoRefresh,
		setView,
	] );

	// One-time prefetch right after the first page is loaded for smoother initial scrolling
	useEffect( () => {
		if ( data?.pages?.length === 1 && hasNextPage && ! isFetchingNextPage ) {
			fetchNextPage();
		}
	}, [ data?.pages?.length, hasNextPage, isFetchingNextPage, fetchNextPage ] );

	useEffect( () => {
		const el = loadMoreRef.current;
		if ( ! el ) {
			return;
		}
		const observer = new IntersectionObserver(
			( entries ) => {
				if ( entries[ 0 ]?.isIntersecting ) {
					infiniteScrollHandler();
				}
			},
			{ root: null, rootMargin: '600px 0px', threshold: 0 }
		);
		observer.observe( el );
		return () => {
			observer.disconnect();
		};
	}, [ infiniteScrollHandler ] );

	const fields = useFields(
		timezoneString ? { logType, timezoneString, gmtOffset } : { logType, gmtOffset }
	);

	const paginationInfo = {
		totalItems: logType === LogType.PHP ? displayedPhpLogs.length : displayedServerLogs.length,
		totalPages: 1,
	};

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
		syncFiltersSearchParams( url.searchParams, allowed, sourceFilters );
		window.history.replaceState( null, '', url.pathname + url.search );

		// Apply view with only allowed filters; reset page if dataset changed
		if ( datasetChanged ) {
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
					data={ displayedPhpLogs }
					isLoading={ isLoading && displayedPhpLogs.length === 0 }
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
					data={ displayedServerLogs }
					isLoading={ isLoading && displayedServerLogs.length === 0 }
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
			{ isFetchingNextPage && (
				<VStack className="site-logs-infinite-loader" spacing={ 2 }>
					<HStack alignment="center" spacing={ 2 }>
						<Spinner />
						<span>{ __( 'Loading more…' ) }</span>
					</HStack>
					<Spacer margin={ 0 } paddingTop={ 3 } />
				</VStack>
			) }
			<Spacer as="div" margin={ 0 } paddingTop={ 1 } ref={ loadMoreRef } aria-hidden />
		</>
	);
}

export default SiteLogsDataViews;
