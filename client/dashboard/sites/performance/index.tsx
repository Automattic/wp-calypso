import { useQuery } from '@tanstack/react-query';
import { useSearch } from '@tanstack/react-router';
import { Button, __experimentalHStack as HStack } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { useState } from 'react';
import { performanceProfilerPagesQuery, siteQuery } from '../../app/queries';
import { siteRoute, sitePerformanceRoute } from '../../app/router';
import { PageHeader } from '../../components/page-header';
import PageLayout from '../../components/page-layout';
import { usePerformanceData } from '../hooks/use-performance-data';
import DeviceTabControls, { ToggleType } from './device-toggle';
import { PageSelectorWrapper } from './page-selector';
import Report from './report';
import type { PerformanceProfilerPage } from '../../data';
import type { Site } from '../../data/types';

/**
 * Get the initial page to display based on the page ID.
 * @param pages - The list of pages to choose from
 * @param pageId - The ID of the page to display
 * @returns The initial page to display
 */
const getPageFromID = ( pages: PerformanceProfilerPage[] | undefined, pageId: string ) => {
	return pages?.find( ( page: PerformanceProfilerPage ) => Number( page.id ) === Number( pageId ) );
};

function SitePerformanceContent( { site }: { site: Site } ) {
	const {
		data: pagesData,
		refetch: refetchPages,
		isLoading: isLoadingPages,
	} = useQuery( {
		...performanceProfilerPagesQuery( site.ID, '' ),
		refetchOnWindowFocus: false,
	} );
	const { page_id } = useSearch( { from: sitePerformanceRoute.fullPath } );
	const initialPage = page_id ? getPageFromID( pagesData, page_id ) : pagesData?.[ 0 ];
	const [ currentPage, setCurrentPage ] = useState( initialPage );
	const {
		desktopReport,
		mobileReport,
		isLoading: isFetchingReport,
		isRunningDesktopReport,
		isRunningMobileReport,
		isError,
		refetch: refetchReport,
	} = usePerformanceData( currentPage?.link, currentPage?.wpcom_performance_report_hash );
	const [ deviceToggle, setDeviceToggle ] = useState< ToggleType >( 'desktop' );

	const handlePageChange = ( pageId: string | null | undefined ) => {
		const page = getPageFromID( pagesData, pageId || '' );

		setCurrentPage( page );
	};

	const handleReportRefetch = async () => {
		await refetchReport();
		refetchPages();
	};

	// TODO: We shouldn't allow public sites to load the SitePerformance page
	if ( 1 !== site.options?.blog_public ) {
		return 'This site is not public. Please make it public to view the performance report.';
	}

	if ( ! pagesData || ! currentPage ) {
		return null;
	}

	const isLoading =
		isLoadingPages || isFetchingReport || isRunningDesktopReport || isRunningMobileReport;

	return (
		<PageLayout>
			<PageHeader title={ __( 'Performance' ) } />
			<HStack spacing={ 2 } alignment="flex-end" justify="flex-start" expanded={ false }>
				<PageSelectorWrapper
					isLoading={ isLoading }
					siteUrl={ site.URL }
					currentPage={ currentPage }
					pages={ pagesData }
					onChange={ handlePageChange }
				/>
				<DeviceTabControls value={ deviceToggle } onChange={ setDeviceToggle } />
				<Button
					variant="secondary"
					onClick={ handleReportRefetch }
					disabled={ isLoading }
					__next40pxDefaultSize
				>
					{ __( 'Retest' ) }
				</Button>
			</HStack>
			<Report
				currentPage={ currentPage }
				report={ deviceToggle === 'desktop' ? desktopReport : mobileReport }
				isFetchingReport={ isFetchingReport }
				isRunningReport={
					deviceToggle === 'desktop' ? isRunningDesktopReport : isRunningMobileReport
				}
				isError={ isError }
				onRetest={ handleReportRefetch }
			/>
		</PageLayout>
	);
}

function SitePerformance() {
	const { siteSlug } = siteRoute.useParams();
	const { data } = useQuery( siteQuery( siteSlug ) );

	if ( ! data || ! data.site ) {
		return null;
	}

	return <SitePerformanceContent site={ data.site } />;
}

export default SitePerformance;
