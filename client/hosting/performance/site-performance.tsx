import page from '@automattic/calypso-router';
import { useMobileBreakpoint } from '@automattic/viewport-react';
import { Button } from '@wordpress/components';
import { translate } from 'i18n-calypso';
import moment from 'moment';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSiteSettings } from 'calypso/blocks/plugins-scheduled-updates/hooks/use-site-settings';
import InlineSupportLink from 'calypso/components/inline-support-link';
import NavigationHeader from 'calypso/components/navigation-header';
import { useUrlBasicMetricsQuery } from 'calypso/data/site-profiler/use-url-basic-metrics-query';
import { useUrlPerformanceInsightsQuery } from 'calypso/data/site-profiler/use-url-performance-insights';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { profilerVersion } from 'calypso/performance-profiler/utils/profiler-version';
import { useDispatch, useSelector } from 'calypso/state';
import getCurrentQueryArguments from 'calypso/state/selectors/get-current-query-arguments';
import getRequest from 'calypso/state/selectors/get-request';
import isAtomicSite from 'calypso/state/selectors/is-site-automated-transfer';
import { launchSite } from 'calypso/state/sites/launch/actions';
import { requestSiteStats } from 'calypso/state/stats/lists/actions';
import { getSiteStatsNormalizedData } from 'calypso/state/stats/lists/selectors';
import { getSelectedSite } from 'calypso/state/ui/selectors';
import { MobileHeader } from './components/MobileHeader';
import { PageSelector } from './components/PageSelector';
import { PerformanceReport } from './components/PerformanceReport';
import { PerformanceReportLoading } from './components/PerformanceReportLoading';
import { ReportUnavailable } from './components/ReportUnavailable';
import { DeviceTabControls, Tab } from './components/device-tab-control';
import { ExpiredReportNotice } from './components/expired-report-notice/expired-report-notice';
import { useSitePerformancePageReports } from './hooks/useSitePerformancePageReports';

import './style.scss';

const statType = 'statsTopPosts';
const statsQuery = {
	num: -1,
	summarize: 1,
	period: 'day',
	date: moment().format( 'YYYY-MM-DD' ),
	max: 0,
};

const usePerformanceReport = (
	setIsSavingPerformanceReportUrl: ( isSaving: boolean ) => void,
	refetchPages: () => void,
	savePerformanceReportUrl: (
		pageId: string,
		wpcom_performance_report_url: { url: string; hash: string }
	) => Promise< void >,
	currentPageId: string,
	wpcom_performance_report_url: { url: string; hash: string } | undefined,
	activeTab: Tab
) => {
	const { url = '', hash = '' } = wpcom_performance_report_url || {};

	const [ retestState, setRetestState ] = useState( 'idle' );

	const {
		data: basicMetrics,
		isError: isBasicMetricsError,
		isFetched: isBasicMetricsFetched,
		isLoading: isLoadingBasicMetrics,
		refetch: requeueAdvancedMetrics,
	} = useUrlBasicMetricsQuery( url, hash, true );
	const { final_url: finalUrl, token } = basicMetrics || {};
	useEffect( () => {
		if ( token && finalUrl ) {
			setIsSavingPerformanceReportUrl( true );
			savePerformanceReportUrl( currentPageId, { url: finalUrl, hash: token } )
				.then( () => {
					refetchPages();
				} )
				.finally( () => {
					setIsSavingPerformanceReportUrl( false );
				} );
		}
		// We only want to run this effect when the token changes.
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [ token ] );
	const {
		data,
		status: insightsStatus,
		isError: isInsightsError,
		isLoading: isLoadingInsights,
	} = useUrlPerformanceInsightsQuery( url, token ?? hash );

	const performanceInsights = data?.pagespeed;

	const mobileReport =
		typeof performanceInsights?.mobile === 'string' ? undefined : performanceInsights?.mobile;
	const desktopReport =
		typeof performanceInsights?.desktop === 'string' ? undefined : performanceInsights?.desktop;

	const performanceReport = activeTab === 'mobile' ? mobileReport : desktopReport;

	const desktopLoaded = typeof performanceInsights?.desktop === 'object';
	const mobileLoaded = typeof performanceInsights?.mobile === 'object';

	const getHashOrToken = (
		hash: string | undefined,
		token: string | undefined,
		isReportLoaded: boolean
	) => {
		if ( hash ) {
			return hash;
		} else if ( token && isReportLoaded ) {
			return token;
		}
		return '';
	};

	const testAgain = useCallback( async () => {
		setRetestState( 'queueing-advanced' );
		const result = await requeueAdvancedMetrics();
		setRetestState( 'polling-for-insights' );
		return result;
	}, [ requeueAdvancedMetrics ] );

	if (
		retestState === 'polling-for-insights' &&
		insightsStatus === 'success' &&
		( activeTab === 'mobile' ? mobileLoaded : desktopLoaded )
	) {
		setRetestState( 'idle' );
	}

	return {
		performanceReport,
		url: finalUrl ?? url,
		hash: getHashOrToken( hash, token, activeTab === 'mobile' ? mobileLoaded : desktopLoaded ),
		isLoading:
			isLoadingBasicMetrics ||
			isLoadingInsights ||
			( activeTab === 'mobile' ? ! mobileLoaded : ! desktopLoaded ),
		isError: isBasicMetricsError || isInsightsError,
		isBasicMetricsFetched,
		testAgain,
		isRetesting: retestState !== 'idle',
	};
};

export const SitePerformance = () => {
	const [ activeTab, setActiveTab ] = useState< Tab >( 'mobile' );
	const dispatch = useDispatch();
	const site = useSelector( getSelectedSite );
	const siteId = site?.ID;
	const { getSiteSetting } = useSiteSettings( site?.slug );
	const blog_public = getSiteSetting( 'blog_public' );
	const isSitePublic = site && blog_public === 1;
	const isSiteAtomic = useSelector( ( state ) => isAtomicSite( state, siteId ) );

	const stats = useSelector( ( state ) =>
		getSiteStatsNormalizedData( state, siteId, statType, statsQuery )
	) as { id: number; value: number }[];

	useEffect( () => {
		if ( ! siteId ) {
			return;
		}

		dispatch( requestSiteStats( siteId, statType, statsQuery ) );
	}, [ dispatch, siteId ] );

	const queryParams = useSelector( getCurrentQueryArguments );
	const {
		pages,
		isInitialLoading,
		savePerformanceReportUrl,
		refetch: refetchPages,
	} = useSitePerformancePageReports();

	const orderedPages = useMemo( () => {
		return [ ...pages ].sort( ( a, b ) => {
			const aVisits = stats.find( ( { id } ) => id === parseInt( a.value, 10 ) )?.value ?? 0;
			const bVisits = stats.find( ( { id } ) => id === parseInt( b.value, 10 ) )?.value ?? 0;
			return bVisits - aVisits;
		} );
	}, [ pages, stats ] );

	const currentPageId = queryParams?.page_id?.toString() ?? '0';
	const filter = queryParams?.filter?.toString();
	const [ recommendationsFilter, setRecommendationsFilter ] = useState( filter );

	// Stores any page selection made by the user, `undefined` by default. See
	// `currentPage` below for logic regarding the default page if the user
	// hasn't selected one yet.
	const [ currentPageUserSelection, setCurrentPageUserSelection ] =
		useState< ( typeof pages )[ number ] >();

	const [ isSavingPerformanceReportUrl, setIsSavingPerformanceReportUrl ] = useState( false );

	const [ prevSiteId, setPrevSiteId ] = useState( siteId );
	if ( prevSiteId !== siteId ) {
		setPrevSiteId( siteId );
		setCurrentPageUserSelection( undefined );
	}

	const currentPage =
		currentPageUserSelection ?? pages?.find( ( page ) => page.value === currentPageId );

	const pageOptions = useMemo( () => {
		const options = currentPage
			? [ currentPage, ...orderedPages.filter( ( p ) => p.value !== currentPage.value ) ]
			: orderedPages;

		// Add a disabled option at the end that will show a disclaimer message.
		return [ ...options, { label: '', value: '-1', path: '', disabled: true } ];
	}, [ currentPage, orderedPages ] );

	const handleRecommendationsFilterChange = ( filter?: string ) => {
		setRecommendationsFilter( filter );
		const url = new URL( window.location.href );

		if ( filter ) {
			url.searchParams.set( 'filter', filter );
		} else {
			url.searchParams.delete( 'filter' );
		}

		window.history.replaceState( {}, '', url.toString() );
	};

	const performanceReport = usePerformanceReport(
		setIsSavingPerformanceReportUrl,
		refetchPages,
		savePerformanceReportUrl,
		currentPageId,
		isSitePublic ? currentPage?.wpcom_performance_report_url : undefined,
		activeTab
	);

	useEffect( () => {
		if ( performanceReport.isBasicMetricsFetched && performanceReport.url ) {
			performance.mark( 'test-started' );
			recordTracksEvent( 'calypso_performance_profiler_test_started', {
				url: performanceReport.url,
				version: profilerVersion(),
			} );
		}
	}, [ performanceReport.isBasicMetricsFetched, performanceReport.url ] );

	const siteIsLaunching = useSelector(
		( state ) => getRequest( state, launchSite( siteId ) )?.isLoading ?? false
	);

	const retestPage = () => {
		recordTracksEvent( 'calypso_performance_profiler_test_again_click' );
		performance.mark( 'test-started' );

		performanceReport.testAgain().then( ( { data } ) => {
			if ( data?.token && data.token !== currentPage?.wpcom_performance_report_url?.hash ) {
				savePerformanceReportUrl( currentPageId, {
					url: data.final_url,
					hash: data.token,
				} );
			}
		} );
	};

	const onLaunchSiteClick = () => {
		if ( site?.is_a4a_dev_site ) {
			recordTracksEvent( 'calypso_performance_profiler_prepare_launch_cta_click' );
			page( `/settings/general/${ site.slug }` );
			return;
		}
		dispatch( launchSite( siteId! ) );
		recordTracksEvent( 'calypso_performance_profiler_launch_site_cta_click' );
	};

	const isMobile = useMobileBreakpoint();
	const disableControls =
		performanceReport.isLoading ||
		isInitialLoading ||
		! isSitePublic ||
		isSavingPerformanceReportUrl;

	const handleDeviceTabChange = ( tab: Tab ) => {
		setActiveTab( tab );
		recordTracksEvent( 'calypso_performance_profiler_device_tab_change', {
			device: tab,
		} );
	};

	// This forces a no pages found message in the dropdown
	const [ noPagesFound, setNoPagesFound ] = useState( { query: '', found: true } );

	const options = ! noPagesFound.found
		? [
				{
					label: noPagesFound.query,
					value: '-2',
					disabled: true,
				},
		  ]
		: pageOptions;

	const pageSelector = (
		<PageSelector
			onFilterValueChange={ ( value ) => {
				const filter = pageOptions.find( ( option ) =>
					option.label.toLowerCase().startsWith( value )
				);

				if ( filter ) {
					setNoPagesFound( { query: '', found: true } );
					return;
				}
				setNoPagesFound( { query: value, found: false } );
			} }
			allowReset={ false }
			onBlur={ () => {
				// if no pages found, reset so that the previous selected page is shown
				if ( ! noPagesFound.found ) {
					setNoPagesFound( { query: '', found: true } );
				}
			} }
			options={ options }
			disabled={ disableControls }
			onChange={ ( page_id ) => {
				const url = new URL( window.location.href );
				recordTracksEvent( 'calypso_performance_profiler_page_selector_change', {
					is_home: page_id === '0',
					version: profilerVersion(),
				} );
				if ( page_id ) {
					setCurrentPageUserSelection( pages.find( ( page ) => page.value === page_id ) );
					url.searchParams.set( 'page_id', page_id );
				} else {
					setCurrentPageUserSelection( undefined );
					url.searchParams.delete( 'page_id' );
				}

				page.replace( url.pathname + url.search );
			} }
			value={ currentPageId }
		/>
	);

	const subtitle =
		! performanceReport.isLoading && performanceReport.performanceReport
			? translate( 'Tested on {{span}}%(testedDate)s{{/span}}. {{button}}Test again{{/button}}', {
					args: {
						testedDate: moment( performanceReport.performanceReport.timestamp ).format(
							'MMMM Do, YYYY h:mm:ss A'
						),
					},
					components: {
						button: (
							<Button
								css={ {
									textDecoration: 'none !important',
									':hover': {
										textDecoration: 'underline !important',
									},
									fontSize: 'inherit',
									whiteSpace: 'nowrap',
								} }
								variant="link"
								onClick={ retestPage }
							/>
						),
						span: (
							<span
								style={ {
									fontVariantNumeric: 'tabular-nums',
								} }
							/>
						),
					},
			  } )
			: translate(
					'Optimize your site for lightning-fast performance. {{link}}Learn more.{{/link}}',
					{
						components: {
							link: <InlineSupportLink supportContext="site-performance" showIcon={ false } />,
						},
					}
			  );

	if ( ! isSiteAtomic ) {
		return null;
	}

	return (
		<div className="site-performance">
			<div className="site-performance-device-tab-controls__container">
				{ isMobile ? (
					<MobileHeader
						pageTitle={ currentPage?.label ?? '' }
						pageSelector={ pageSelector }
						subtitle={ subtitle }
					/>
				) : (
					<NavigationHeader
						className="site-performance__navigation-header"
						title={ translate( 'Performance' ) }
						subtitle={ subtitle }
					/>
				) }
				{ ! isMobile && pageSelector }
				<DeviceTabControls
					showTitle={ ! isMobile }
					onDeviceTabChange={ handleDeviceTabChange }
					disabled={ disableControls }
					value={ activeTab }
				/>
			</div>
			{ isInitialLoading && isSitePublic ? (
				<PerformanceReportLoading isLoadingPages isSavedReport={ false } pageTitle="" />
			) : (
				<>
					{ ! isSitePublic ? (
						<ReportUnavailable
							isLaunching={ siteIsLaunching }
							onLaunchSiteClick={ onLaunchSiteClick }
							ctaText={
								site?.is_a4a_dev_site
									? translate( 'Prepare for launch' )
									: translate( 'Launch your site' )
							}
						/>
					) : (
						currentPage && (
							<>
								<ExpiredReportNotice
									reportTimestamp={ performanceReport.performanceReport?.timestamp }
									onRetest={ retestPage }
								/>
								<PerformanceReport
									{ ...performanceReport }
									pageTitle={ currentPage.label }
									onRetestClick={ retestPage }
									onFilterChange={ handleRecommendationsFilterChange }
									filter={ recommendationsFilter }
								/>
							</>
						)
					) }
				</>
			) }
		</div>
	);
};
