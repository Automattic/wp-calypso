import { useMutation, useQuery } from '@tanstack/react-query';
import { useSearch } from '@tanstack/react-router';
import { Button } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { useState } from 'react';
import { siteQuery, siteSettingsQuery, siteSettingsMutation } from '../../app/queries';
import { siteRoute, sitePerformanceRoute } from '../../app/router';
import { PageHeader } from '../../components/page-header';
import PageLayout from '../../components/page-layout';
import { usePerformanceData } from '../hooks/use-performance-data';
import {
	useSitePages,
	savePageMeta,
	type PageReport,
	type PerformanceReportUrl,
} from '../hooks/use-site-pages';
import DeviceTabControls, { ToggleType } from './device-toggle';
import { PageSelectorWrapper } from './page-selector';
import Report from './report';
import type { Site } from '../../data/types';

const DEFAULT_HOMEPAGE_ID = '0';

/**
 * Get the hash from the URL
 * @param url - The URL to get the hash from
 * @returns The hash from the URL
 */
const getHashFromUrl = ( url: string | undefined ): string => {
	if ( ! url ) {
		return '';
	}

	const [ , hash ] = url.split( '&hash=' );
	return hash;
};

/**
 * Get the initial page to display based on the page ID
 * @param pages - The list of pages to choose from
 * @param pageId - The ID of the page to display
 * @returns The initial page to display
 */
const getPageFromID = ( pages: PageReport[], pageId: string ) => {
	return pages?.find( ( page ) => Number( page.value ) === Number( pageId ) );
};

function SitePerformanceContent( { site }: { site: Site } ) {
	const { page_id } = useSearch( { from: sitePerformanceRoute.fullPath } );
	const [ deviceTab, setDeviceTab ] = useState< ToggleType >( 'desktop' );

	const { data: siteSettings } = useQuery( siteSettingsQuery( site.ID ) );
	const cachedHash = getHashFromUrl( siteSettings?.wpcom_performance_report_url );

	const { pages } = useSitePages( {
		siteId: site.ID,
		siteUrl: site.URL,
		homepageHash: cachedHash,
		defaultHomepageID: DEFAULT_HOMEPAGE_ID,
	} );
	const initialPage = getPageFromID( pages, page_id || DEFAULT_HOMEPAGE_ID );
	const [ currentPage, setCurrentPage ] = useState< PageReport | undefined >( initialPage );
	const {
		desktopReport,
		mobileReport,
		isLoading,
		isRunningDesktopReport,
		isRunningMobileReport,
		isError,
		refetch,
	} = usePerformanceData( currentPage?.url, currentPage?.wpcom_performance_report_url?.hash );
	const mutation = useMutation( siteSettingsMutation( site.ID ) );

	const handlePageChange = ( pageId: string | null | undefined ) => {
		const page = getPageFromID( pages, pageId || '' );

		setCurrentPage( page );
	};

	/**
	 * Save the performance report URL to the page meta.
	 * The front end is responsible for saving the performance report URL to the page meta.
	 * @param pageId The ID of the page to save the performance report URL to.
	 * @param reportUrl The performance report URL to save.
	 * @returns A promise that resolves to the saved performance report URL.
	 */
	const savePerformanceReportUrl = async ( pageId: string, reportUrl: PerformanceReportUrl ) => {
		const performanceReportUrl = `${ reportUrl.url }&hash=${ reportUrl.hash }`;

		// if ( ! isValidURL( performanceReportUrl ) ) {
		// 	return;
		// }

		// Update default site settings if the page is the homepage
		if ( pageId === DEFAULT_HOMEPAGE_ID ) {
			return mutation.mutate( {
				wpcom_performance_report_url: performanceReportUrl,
			} );
		}

		return await savePageMeta( site.ID, parseInt( pageId, 10 ), performanceReportUrl );
	};

	// TODO: Remove this once we have a way to handle the report for private sites
	if ( 1 !== site.options?.blog_public ) {
		return 'This site is not public. Please make it public to view the performance report.';
	}

	return (
		<PageLayout>
			<PageHeader
				title={ __( 'Performance' ) }
				description={
					<Button isPrimary onClick={ refetch }>
						{ __( 'Retest' ) }
					</Button>
				}
				actions={
					<>
						<PageSelectorWrapper
							siteId={ site.ID }
							currentPage={ currentPage }
							pages={ pages }
							onChange={ handlePageChange }
							disabled={ isLoading || isRunningDesktopReport || isRunningMobileReport }
						/>
						<DeviceTabControls value={ deviceTab } onChange={ setDeviceTab } />
					</>
				}
			/>
			<Report
				currentPage={ currentPage }
				report={ deviceTab === 'desktop' ? desktopReport : mobileReport }
				isError={ isError }
				isLoading={ isLoading }
				isRunningReport={ isRunningDesktopReport || isRunningMobileReport }
				onRetest={ refetch }
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
