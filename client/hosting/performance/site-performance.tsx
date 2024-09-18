import page from '@automattic/calypso-router';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from '@wordpress/components';
import { useDebouncedInput } from '@wordpress/compose';
import { translate } from 'i18n-calypso';
import moment from 'moment';
import { useEffect, useMemo, useState } from 'react';
import InlineSupportLink from 'calypso/components/inline-support-link';
import NavigationHeader from 'calypso/components/navigation-header';
import { useUrlBasicMetricsQuery } from 'calypso/data/site-profiler/use-url-basic-metrics-query';
import { useUrlPerformanceInsightsQuery } from 'calypso/data/site-profiler/use-url-performance-insights';
import { useDispatch, useSelector } from 'calypso/state';
import getCurrentQueryArguments from 'calypso/state/selectors/get-current-query-arguments';
import getRequest from 'calypso/state/selectors/get-request';
import { launchSite } from 'calypso/state/sites/launch/actions';
import { requestSiteStats } from 'calypso/state/stats/lists/actions';
import { getSiteStatsNormalizedData } from 'calypso/state/stats/lists/selectors';
import { getSelectedSite } from 'calypso/state/ui/selectors';
import { PageSelector } from './components/PageSelector';
import { PerformanceReport } from './components/PerformanceReport';
import { ReportUnavailable } from './components/ReportUnavailable';
import { DeviceTabControls, Tab } from './components/device-tab-control';
import { getSitePagesQueryKey, useSitePages } from './hooks/useSitePages';

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
	wpcom_performance_url: { url: string; hash: string } | undefined,
	activeTab: Tab
) => {
	const { url = '', hash = '' } = wpcom_performance_url || {};

	const { data: basicMetrics } = useUrlBasicMetricsQuery( url, hash, true );
	const { final_url: finalUrl, token } = basicMetrics || {};
	const { data: performanceInsights, isLoading: isLoadingInsights } =
		useUrlPerformanceInsightsQuery( url, token ?? hash );

	const mobileReport =
		typeof performanceInsights?.mobile === 'string' ? undefined : performanceInsights?.mobile;
	const desktopReport =
		typeof performanceInsights?.desktop === 'string' ? undefined : performanceInsights?.desktop;

	const performanceReport = activeTab === 'mobile' ? mobileReport : desktopReport;

	const desktopLoaded = 'completed' === performanceInsights?.status;
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

	return {
		performanceReport,
		url: finalUrl ?? url,
		hash: getHashOrToken( hash, token, activeTab === 'mobile' ? mobileLoaded : desktopLoaded ),
		isLoading: activeTab === 'mobile' ? ! mobileLoaded : ! desktopLoaded,
		isError: ! isLoadingInsights && ! basicMetrics,
	};
};

export const SitePerformance = () => {
	const [ activeTab, setActiveTab ] = useState< Tab >( 'mobile' );
	const dispatch = useDispatch();
	const site = useSelector( getSelectedSite );
	const siteId = site?.ID;

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
	const [ , setQuery, query ] = useDebouncedInput();
	const pages = useSitePages( { query } );

	const orderedPages = useMemo( () => {
		return [ ...pages ].sort( ( a, b ) => {
			const aVisits = stats.find( ( { id } ) => id === parseInt( a.value, 10 ) )?.value ?? 0;
			const bVisits = stats.find( ( { id } ) => id === parseInt( b.value, 10 ) )?.value ?? 0;
			return bVisits - aVisits;
		} );
	}, [ pages, stats ] );

	const currentPageId = queryParams?.page_id?.toString() ?? '0';
	const currentPage = useMemo(
		() => pages.find( ( page ) => page.value === currentPageId ),
		[ pages, currentPageId ]
	);
	const [ wpcom_performance_url, setWpcom_performance_url ] = useState(
		currentPage?.wpcom_performance_url
	);
	const queryClient = useQueryClient();

	const retestPage = () => {
		setWpcom_performance_url( {
			url: currentPage?.url ?? '',
			hash: '',
		} );

		queryClient.invalidateQueries( {
			queryKey: getSitePagesQueryKey( { siteId, query } ),
			exact: true,
		} );
	};

	const performanceReport = usePerformanceReport( wpcom_performance_url, activeTab );

	const isSitePublic =
		site && ! site.is_coming_soon && ! site.is_private && site.launch_status === 'launched';

	const siteIsLaunching = useSelector(
		( state ) => getRequest( state, launchSite( siteId ) )?.isLoading ?? false
	);

	const onLaunchSiteClick = () => {
		dispatch( launchSite( siteId! ) );
	};

	return (
		<div className="site-performance">
			<div className="site-performance-device-tab-controls__container">
				<NavigationHeader
					className="site-performance__navigation-header"
					title={ translate( 'Performance' ) }
					subtitle={
						performanceReport.performanceReport
							? translate( 'Tested on %(testedDate)s. {{button}}Test again{{/button}}', {
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
									},
							  } )
							: translate(
									'Optimize your site for lightning-fast performance. {{link}}Learn more.{{/link}}',
									{
										components: {
											link: (
												<InlineSupportLink supportContext="site-monitoring" showIcon={ false } />
											),
										},
									}
							  )
					}
				/>
				<PageSelector
					onFilterValueChange={ setQuery }
					options={ orderedPages }
					onChange={ ( page_id ) => {
						const url = new URL( window.location.href );

						if ( page_id ) {
							url.searchParams.set( 'page_id', page_id );
						} else {
							url.searchParams.delete( 'page_id' );
						}

						page.replace( url.pathname + url.search );
					} }
					value={ currentPageId }
				/>
				<DeviceTabControls onDeviceTabChange={ setActiveTab } value={ activeTab } />
			</div>
			{ ! isSitePublic ? (
				<ReportUnavailable
					isLaunching={ siteIsLaunching }
					onLaunchSiteClick={ onLaunchSiteClick }
				/>
			) : (
				currentPage && (
					<PerformanceReport
						{ ...performanceReport }
						pageTitle={ currentPage.label }
						onRetestClick={ retestPage }
					/>
				)
			) }
		</div>
	);
};
