import {
	performanceProfilerPagesQuery,
	siteBySlugQuery,
	siteSettingsQuery,
} from '@automattic/api-queries';
import { useQuery, useSuspenseQuery } from '@tanstack/react-query';
import { useSearch } from '@tanstack/react-router';
import { __ } from '@wordpress/i18n';
import { useState } from 'react';
import { usePerformanceData } from '../../app/hooks/site-performance';
import { sitePerformanceRoute, siteRoute } from '../../app/router/sites';
import { PageHeader } from '../../components/page-header';
import PageLayout from '../../components/page-layout';
import DeviceToggle, { ToggleType } from './device-toggle';
import PageSelector from './page-selector';
import Report from './report';
import ReportLoading from './report-loading';
import SubTitle from './subtitle';
import type { Site, SiteSettings, PerformanceProfilerPage } from '@automattic/api-core';

/**
 * Get the initial page to display based on the page ID.
 * @param pages - The list of pages to choose from
 * @param pageId - The ID of the page to display
 * @returns The initial page to display
 */
const getPageFromID = ( pages: PerformanceProfilerPage[] | undefined, pageId: string ) => {
	return pages?.find( ( page: PerformanceProfilerPage ) => Number( page.id ) === Number( pageId ) );
};

function SitePerformanceContent( { site, settings }: { site: Site; settings: SiteSettings } ) {
	const { data: pagesData, refetch: refetchPages } = useQuery( {
		...performanceProfilerPagesQuery( site.ID ),
		refetchOnWindowFocus: false,
	} );

	const { page_id } = useSearch( { from: sitePerformanceRoute.fullPath } ) as { page_id?: string };
	const initialPage = page_id ? getPageFromID( pagesData, page_id ) : pagesData?.[ 0 ];
	const [ currentPage, setCurrentPage ] = useState( initialPage );
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
	const [ deviceToggle, setDeviceToggle ] = useState< ToggleType >( 'mobile' );

	const handlePageChange = ( pageId: string | null | undefined ) => {
		const page = getPageFromID( pagesData, pageId || '' );

		setCurrentPage( page );
	};

	const handleReportRefetch = async () => {
		await refetchReport();
		// Once we get a token back, we can refetch the pages to get the updated hash.
		refetchPages();
	};

	// TODO: We shouldn't allow public sites to load the SitePerformance page.
	if ( 1 !== settings.blog_public ) {
		return 'This site is not public. Please make it public to view the performance report.';
	}

	if ( ! pagesData || ! currentPage ) {
		return null;
	}

	const isDesktopSelected = deviceToggle === 'desktop';
	const currentReport = isDesktopSelected ? desktopReport : mobileReport;
	const isRunningReport = isDesktopSelected ? isDesktopReportRunning : isMobileReportRunning;

	return (
		<PageLayout>
			<PageHeader
				title={ __( 'Performance' ) }
				description={
					<SubTitle timestamp={ currentReport?.timestamp } onClick={ handleReportRefetch } />
				}
				actions={
					<>
						<PageSelector
							siteUrl={ site.URL }
							currentPage={ currentPage }
							pages={ pagesData }
							onChange={ handlePageChange }
						/>
						<DeviceToggle value={ deviceToggle } onChange={ setDeviceToggle } />
					</>
				}
			/>
			<div className="site-performance-report">
				{ isFetchingReport || isRunningReport || ! currentReport ? (
					<ReportLoading
						pageTitle={ currentPage.title.rendered }
						isSavedReport={
							isFetchingReport || ( ! currentReport && ( desktopLoaded || mobileLoaded ) )
						}
					/>
				) : (
					<Report
						currentPage={ currentPage }
						report={ currentReport }
						isError={
							( isDesktopSelected ? isDesktopReportError : isMobileReportError ) || isError
						}
						onRetest={ handleReportRefetch }
					/>
				) }
			</div>
		</PageLayout>
	);
}

function SitePerformance() {
	const { siteSlug } = siteRoute.useParams();
	const { data: site } = useSuspenseQuery( siteBySlugQuery( siteSlug ) );
	const { data: settings } = useSuspenseQuery( siteSettingsQuery( site.ID ) );

	return <SitePerformanceContent site={ site } settings={ settings } />;
}

export default SitePerformance;
