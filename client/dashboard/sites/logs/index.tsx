import { useQuery, useSuspenseQuery } from '@tanstack/react-query';
import { useRouter } from '@tanstack/react-router';
import { __experimentalText as Text, TabPanel, ToggleControl } from '@wordpress/components';
import { DataViews, View, Filter } from '@wordpress/dataviews';
import { __ } from '@wordpress/i18n';
import { chartBar } from '@wordpress/icons';
import { getUnixTime, subDays, isSameSecond } from 'date-fns';
import { useMemo, useState, useRef, useEffect } from 'react';
import { useAnalytics } from '../../app/analytics';
import { useLocale } from '../../app/locale';
import { siteBySlugQuery } from '../../app/queries/site';
import { siteLogsQuery } from '../../app/queries/site-logs';
import { siteSettingsQuery } from '../../app/queries/site-settings';
import { siteRoute } from '../../app/router/sites';
import { Callout } from '../../components/callout';
import { CalloutOverlay } from '../../components/callout-overlay';
import { DataViewsCard } from '../../components/dataviews-card';
import { DateRangePicker } from '../../components/date-range-picker';
import Notice from '../../components/notice';
import { PageHeader } from '../../components/page-header';
import PageLayout from '../../components/page-layout';
import UpsellCTAButton from '../../components/upsell-cta-button';
import { HostingFeatures } from '../../data/constants';
import { LogType, PHPLog, ServerLog, SiteLogsParams } from '../../data/site-logs';
import { parseYmdLocal, formatYmd } from '../../utils/datetime';
import { hasHostingFeature } from '../../utils/site-features';
import { useActions } from './dataviews/actions';
import { useFields } from './dataviews/fields';
import { getInitialFiltersFromSearch, getAllowedFields } from './dataviews/filters';
import { useView, toFilterParams } from './dataviews/views';
import { LogsDownloader } from './downloader';
import illustrationUrl from './logs-callout-illustration.svg';
import { buildTimeRangeInSeconds, getInitialDateRangeFromSearch } from './utils';

import './style.scss';

export function SiteLogsCallout( {
	siteSlug,
	titleAs = 'h1',
}: {
	siteSlug: string;
	titleAs?: React.ElementType | keyof JSX.IntrinsicElements;
} ) {
	return (
		<Callout
			icon={ chartBar }
			title={ __( 'Access detailed logs' ) }
			titleAs={ titleAs }
			image={ illustrationUrl }
			description={
				<>
					<Text as="p" variant="muted">
						{ __(
							'Quickly identify and fix issues before they impact your visitors with full visibility into your site‘s web server logs and PHP errors.'
						) }
					</Text>
					<Text as="p" variant="muted">
						{ __( 'Available on the WordPress.com Business and Commerce plans.' ) }
					</Text>
				</>
			}
			actions={
				<UpsellCTAButton
					text={ __( 'Upgrade plan' ) }
					tracksId="logs"
					variant="primary"
					href={ `/checkout/${ siteSlug }/business` }
				/>
			}
		/>
	);
}

const LOG_TABS = [
	{ name: 'php', title: __( 'PHP error' ) },
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

	const siteToday = parseYmdLocal( formatYmd( new Date(), timezoneString, gmtOffset ) )!;
	const initial = {
		start: new Date( siteToday.getFullYear(), siteToday.getMonth(), siteToday.getDate() - 6 ),
		end: siteToday,
	};

	const initialFromUrl = getInitialDateRangeFromSearch( search );

	const [ dateRange, setDateRange ] = useState< { start: Date; end: Date } >(
		() => initialFromUrl ?? initial
	);

	const lastUrlRangeRef = useRef< { from: number; to: number } | null >( null );

	useEffect( () => {
		if ( ! autoRefresh ) {
			return;
		}
		const tick = () => {
			const end = new Date();
			const start = subDays( end, 7 );

			setDateRange( ( prev ) =>
				isSameSecond( prev.start, start ) && isSameSecond( prev.end, end ) ? prev : { start, end }
			);
			const from = getUnixTime( start );
			const to = getUnixTime( end );

			const last = lastUrlRangeRef.current;
			// Only sync URL when from/to change to avoid unnecessary history updates.
			if ( ! last || last.from !== from || last.to !== to ) {
				const url = new URL( window.location.href );
				url.searchParams.set( 'from', String( from ) );
				url.searchParams.set( 'to', String( to ) );
				window.history.replaceState( null, '', url.pathname + url.search );
				lastUrlRangeRef.current = { from, to };
			}
		};

		// Run immediately, then every 10s
		tick();
		const intervalId = setInterval( tick, 10 * 1000 );
		return () => clearInterval( intervalId );
	}, [ autoRefresh ] );

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

	const { data: siteLogs, isFetching } = useQuery( siteLogsQuery( siteId, params, scrollId ) );

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

	const handleDateRangeChange = ( next: { start: Date; end: Date } ) => {
		setAutoRefresh( false );
		setDateRange( next );

		// Reset pagination + cursors
		cursorsRef.current.clear();
		setView( ( value ) => ( { ...value, page: 1 } ) );

		// Sync from/to to the URL as UNIX seconds
		const url = new URL( window.location.href );
		url.searchParams.set( 'from', String( getUnixTime( next.start ) ) );
		url.searchParams.set( 'to', String( getUnixTime( next.end ) ) );
		window.history.replaceState( null, '', url.pathname + url.search );
	};

	const logs = useMemo( () => {
		const suffix = scrollId ? scrollId.slice( 0, 8 ) : `p${ view.page }`;
		const items = ( siteLogs?.logs ?? [] ) as Array< PHPLog | ServerLog >;

		return items.map( ( log: PHPLog | ServerLog, item: number ) => {
			if ( logType === LogType.PHP ) {
				const php = log as PHPLog;
				return {
					...php,
					id: `${ php.timestamp }|${ php.file }|${ String( php.line ) }|${ suffix }|${ String(
						item
					) }`,
				};
			}
			const server = log as ServerLog;
			return {
				...server,
				id: `${ String( server.timestamp ) }|${ server.request_type }|${ server.status }|${
					server.request_url
				}|${ server.user_ip }|${ suffix }|${ String( item ) }`,
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

	const handleTabChange = ( tab: LogType ) => {
		if ( tab === LogType.PHP ) {
			router.navigate( { to: `/sites/${ siteSlug }/logs/php` } );
		} else {
			router.navigate( { to: `/sites/${ siteSlug }/logs/server` } );
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

	if ( ! site ) {
		return;
	}

	return (
		<PageLayout header={ <PageHeader title={ __( 'Logs' ) } /> }>
			{ notice && (
				<div style={ { marginBottom: 12 } }>
					<Notice variant={ notice.variant }>{ notice.message }</Notice>
				</div>
			) }
			<CalloutOverlay
				showCallout={ ! hasHostingFeature( site, HostingFeatures.LOGS ) }
				callout={ <SiteLogsCallout siteSlug={ site.slug } /> }
				main={
					<>
						<DateRangePicker
							start={ dateRange.start }
							end={ dateRange.end }
							gmtOffset={ gmtOffset }
							timezoneString={ timezoneString }
							locale={ locale }
							onChange={ handleDateRangeChange }
						/>
						<TabPanel
							className="site-logs-tabs"
							activeClass="is-active"
							tabs={ LOG_TABS }
							onSelect={ ( tabName ) => {
								if ( tabName === LogType.PHP || tabName === LogType.SERVER ) {
									handleTabChange( tabName );
								}
							} }
							initialTabName={ logType }
						>
							{ () => (
								<DataViewsCard>
									<DataViews< PHPLog | ServerLog >
										data={ logs ?? [] }
										isLoading={ isFetching }
										paginationInfo={ paginationInfo }
										fields={ fields ?? [] }
										view={ view }
										actions={ actions }
										search={ false }
										defaultLayouts={ { table: {} } }
										onChangeView={ onChangeView }
										header={
											<>
												<LogsDownloader
													siteId={ siteId }
													siteSlug={ site.slug }
													logType={ logType }
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
										}
									/>
								</DataViewsCard>
							) }
						</TabPanel>
					</>
				}
			/>
		</PageLayout>
	);
}

export default SiteLogs;
