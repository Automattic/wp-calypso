import { HostingFeatures } from '@automattic/api-core';
import {
	siteBySlugQuery,
	sitePerformancePagesQuery,
	siteSettingsQuery,
} from '@automattic/api-queries';
import { useQuery, useSuspenseQuery } from '@tanstack/react-query';
import { useNavigate, useSearch } from '@tanstack/react-router';
import { __experimentalHStack as HStack } from '@wordpress/components';
import { useState, useMemo } from 'react';
import { useAnalytics } from '../../app/analytics';
import { usePerformanceData } from '../../app/hooks/site-performance';
import { sitePerformanceRoute, siteRoute } from '../../app/router/sites';
import { PageHeader } from '../../components/page-header';
import PageLayout from '../../components/page-layout';
import HostingFeatureGatedWithCallout from '../hosting-feature-gated-with-callout';
import DeviceToggle from './device-toggle';
import PageSelector from './page-selector';
import { getPerformanceCalloutProps } from './performance-callout';
import Report from './report';
import ReportErrorNotice from './report-error-notice';
import ReportExpiredNotice from './report-expired-notice';
import ReportLoading from './report-loading';
import Subtitle from './subtitle';
import type { DeviceToggleType } from './types';
import type { Site, SitePerformancePage } from '@automattic/api-core';

/**
 * Get the initial page to display based on the page ID.
 * @param pages - The list of pages to choose from
 * @param pageId - The ID of the page to display
 * @returns The initial page to display
 */
const getPageFromID = ( pages: SitePerformancePage[] | undefined, pageId: string ) => {
	return pages?.find( ( page: SitePerformancePage ) => Number( page.id ) === Number( pageId ) );
};

function SitePerformanceContent( { site }: { site: Site } ) {
	const { data: siteSettings } = useSuspenseQuery( {
		...siteSettingsQuery( site.ID ),
		select: ( s ) => ( {
			gmtOffset: Number( s?.gmt_offset ) || 0,
			timezoneString: s?.timezone_string || undefined,
		} ),
	} );
	const { data: pagesData, refetch: refetchPages } = useQuery( {
		...sitePerformancePagesQuery( site.ID ),
		refetchOnWindowFocus: false,
	} );
	const { page_id } = useSearch( { from: sitePerformanceRoute.fullPath } ) as { page_id?: string };
	const currentPage = useMemo( () => {
		return page_id ? getPageFromID( pagesData, page_id ) : pagesData?.[ 0 ];
	}, [ page_id, pagesData ] );
	const [ deviceToggle, setDeviceToggle ] = useState< DeviceToggleType >( 'mobile' );
	const {
		desktopReport,
		mobileReport,
		isLoading: isFetchingReport,
		isDesktopReportRunning,
		isMobileReportRunning,
		desktopLoaded,
		mobileLoaded,
		isError,
		isDesktopReportError,
		isMobileReportError,
		refetch: refetchReport,
	} = usePerformanceData( currentPage?.link, currentPage?.wpcom_performance_report_hash );
	const { recordTracksEvent } = useAnalytics();
	const navigate = useNavigate( { from: sitePerformanceRoute.fullPath } );

	const handleReportRefetch = async () => {
		await refetchReport();
		// Once we get a token back, we can refetch the pages to get the updated hash.
		refetchPages();
	};

	if ( ! pagesData || ! currentPage ) {
		return null;
	}

	const isDesktopSelected = deviceToggle === 'desktop';
	const currentReport = isDesktopSelected ? desktopReport : mobileReport;
	const isRunningReport = isDesktopSelected ? isDesktopReportRunning : isMobileReportRunning;
	const hasError = ( isDesktopSelected ? isDesktopReportError : isMobileReportError ) || isError;
	const { gmtOffset, timezoneString } = siteSettings;

	const renderContent = () => {
		if ( hasError ) {
			return <ReportErrorNotice onRetestClick={ handleReportRefetch } />;
		}

		if ( isFetchingReport || isRunningReport || ! currentReport ) {
			return (
				<ReportLoading
					isSavedReport={
						isFetchingReport || ( ! currentReport && ( desktopLoaded || mobileLoaded ) )
					}
				/>
			);
		}

		return (
			<>
				<ReportExpiredNotice
					reportTimestamp={ currentReport.timestamp }
					onRetest={ handleReportRefetch }
				/>
				<Report
					report={ currentReport }
					device={ deviceToggle }
					hash={ currentPage?.wpcom_performance_report_hash }
				/>
			</>
		);
	};

	return (
		<PageLayout>
			<PageHeader
				description={
					<Subtitle
						timestamp={ currentReport?.timestamp }
						timezoneString={ timezoneString }
						gmtOffset={ gmtOffset }
						onClick={ handleReportRefetch }
					/>
				}
				actions={
					<HStack>
						<PageSelector
							siteUrl={ site.URL }
							currentPage={ currentPage }
							pages={ pagesData }
							onChange={ ( pageId ) => {
								recordTracksEvent( 'calypso_dashboard_performance_profiler_page_selector_change', {
									is_home: pageId === '0',
								} );

								navigate( {
									search: ( prev: Record< string, string > ) => ( {
										...prev,
										page_id: Number( pageId ),
									} ),
								} );
							} }
						/>
						<DeviceToggle value={ deviceToggle } onChange={ setDeviceToggle } />
					</HStack>
				}
			/>
			{ renderContent() }
		</PageLayout>
	);
}

function SitePerformance() {
	const { siteSlug } = siteRoute.useParams();
	const { data: site } = useSuspenseQuery( siteBySlugQuery( siteSlug ) );

	return (
		<HostingFeatureGatedWithCallout
			site={ site }
			feature={ HostingFeatures.PERFORMANCE }
			overlay={ <PageLayout header={ <PageHeader /> } /> }
			{ ...getPerformanceCalloutProps() }
		>
			<SitePerformanceContent site={ site } />
		</HostingFeatureGatedWithCallout>
	);
}

export default SitePerformance;
