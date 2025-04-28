import { useQuery } from '@tanstack/react-query';
import { __ } from '@wordpress/i18n';
import { useEffect, useState } from 'react';
import { usePerformanceReport } from 'calypso/hosting/performance/hooks/usePerformanceReport';
import { useSitePerformancePageReports } from 'calypso/hosting/performance/hooks/useSitePerformancePageReports';
import { SitePerformanceContent } from 'calypso/hosting/performance/site-performance';
import {
	DeviceTabProvider,
	useDeviceTab,
} from 'calypso/hosting/performance/contexts/device-tab-context';
import { siteQuery, siteSettingsQuery } from '../app/queries';
import { siteRoute } from '../app/router';
import PageLayout from '../page-layout';

function SitePerformance() {
	const { siteId, pageId } = siteRoute.useParams();
	const { data } = useQuery( siteQuery( siteId ) );
	const { data: siteSettings, isLoading: isLoadingSiteSettings } = useQuery(
		siteSettingsQuery( siteId )
	);
	const { activeTab, setActiveTab } = useDeviceTab();
	const isSitePublic = data?.site.options?.blog_public === 1;
	const isSiteAtomic = data?.site.options?.is_wpcom_atomic;

	const {
		pages,
		isInitialLoading,
		savePerformanceReportUrl,
		refetch: refetchPages,
	} = useSitePerformancePageReports( {
		site: data?.site,
		reportUrl: siteSettings?.settings?.wpcom_performance_report_url,
	} );

	console.log( pageId );
	const currentPageId = pageId ?? '0';

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
			// recordTracksEvent( 'calypso_performance_profiler_test_started', {
			// 	url: performanceReport.url,
			// 	version: profilerVersion(),
			// } );
		}
	}, [ performanceReport.isBasicMetricsFetched, performanceReport.url ] );

	const retestPage = () => {
		//recordTracksEvent( 'calypso_performance_profiler_test_again_click' );
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
		if ( true ) {
			//recordTracksEvent( 'calypso_performance_profiler_prepare_launch_cta_click' );
			location.href = `/sites/settings/site/${ data.site.slug }`;
			return;
		}
		//dispatch( launchSite( siteId! ) );
		//recordTracksEvent( 'calypso_performance_profiler_launch_site_cta_click' );
	};

	const disableControls =
		performanceReport.isLoading ||
		isInitialLoading ||
		! isSitePublic ||
		isSavingPerformanceReportUrl;

	const handleDeviceTabChange = ( tab: TabType ) => {
		setActiveTab( tab );
		// recordTracksEvent( 'calypso_performance_profiler_device_tab_change', {
		// 	device: tab,
		// } );
	};

	// const subtitle =
	// 	! performanceReport.isLoading && performanceReport.performanceReport
	// 		? translate( 'Tested on {{span}}%(testedDate)s{{/span}}. {{button}}Test again{{/button}}', {
	// 				args: {
	// 					testedDate: moment( performanceReport.performanceReport.timestamp ).format(
	// 						'MMMM Do, YYYY h:mm:ss A'
	// 					),
	// 				},
	// 				components: {
	// 					button: (
	// 						<Button
	// 							css={ {
	// 								textDecoration: 'none !important',
	// 								':hover': {
	// 									textDecoration: 'underline !important',
	// 								},
	// 								fontSize: 'inherit',
	// 								whiteSpace: 'nowrap',
	// 							} }
	// 							variant="link"
	// 							onClick={ retestPage }
	// 						/>
	// 					),
	// 					span: (
	// 						<span
	// 							style={ {
	// 								fontVariantNumeric: 'tabular-nums',
	// 							} }
	// 						/>
	// 					),
	// 				},
	// 		  } )
	// 		: translate(
	// 				'Optimize your site for lightning-fast performance. {{link}}Learn more.{{/link}}',
	// 				{
	// 					components: {
	// 						link: <InlineSupportLink { ...getSupportLinkProps() } />,
	// 					},
	// 				}
	// 		  );

	// Ensure booleans are always boolean
	const isSiteAtomicBool = Boolean( isSiteAtomic );
	const isSitePublicBool = Boolean( isSitePublic );
	const isInitialLoadingBool = Boolean( isInitialLoading );
	const disableControlsBool = Boolean( disableControls );

	// Ensure pageSelector is always a valid ReactElement
	const validPageSelector = <></>;

	if ( ! isSiteAtomicBool ) {
		return null;
	}

	return (
		<PageLayout title={ __( 'Performance' ) }>
			<DeviceTabProvider>
				<SitePerformanceContent
					activeTab={ activeTab }
					isSitePublic={ isSitePublicBool }
					isInitialLoading={ isInitialLoadingBool }
					disableControls={ disableControlsBool }
					pageSelector={ validPageSelector }
					subtitle={ 'sdf' }
					siteIsLaunching={ false }
					onLaunchSiteClick={ onLaunchSiteClick }
					retestPage={ retestPage }
					handleDeviceTabChange={ handleDeviceTabChange }
					performanceReport={ performanceReport }
					currentPage={ currentPage }
				/>
			</DeviceTabProvider>
		</PageLayout>
	);
}

export default SitePerformance;
