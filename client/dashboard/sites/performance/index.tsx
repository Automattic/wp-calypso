import { useQuery } from '@tanstack/react-query';
import { useSearch } from '@tanstack/react-router';
import { __ } from '@wordpress/i18n';
import { useState } from 'react';
import { siteSettingsQuery, siteQuery } from '../../app/queries';
import { siteRoute, sitePerformanceRoute } from '../../app/router';
import { PageHeader } from '../../components/page-header';
import PageLayout from '../../components/page-layout';
import { usePerformanceData } from '../hooks/use-performance-data';
import { useSitePages, type PageReport } from '../hooks/use-site-pages';
import DeviceTabControls, { ToggleType } from './device-toggle';
import { PageSelectorWrapper } from './page-selector';
import Report from './report';
import type { Site } from '../../data/types';

const getHashFromUrl = ( url: string | undefined ): string => {
	if ( ! url ) {
		return '';
	}

	const [ , hash ] = url.split( '&hash=' );
	return hash;
};

function SitePerformanceContent( { site }: { site: Site } ) {
	const { page_id } = useSearch( { from: sitePerformanceRoute.fullPath } );
	const [ deviceTab, setDeviceTab ] = useState< ToggleType >( 'desktop' );

	const { data: siteSettings } = useQuery( {
		...siteSettingsQuery( site.ID ),
		refetchOnWindowFocus: false,
		retry: false,
		enabled: !! site.ID,
	} );

	const cachedHash = getHashFromUrl( siteSettings?.wpcom_performance_report_url );

	const defaultHomepageID = '0';
	const { pages } = useSitePages( {
		siteId: site.ID,
		siteUrl: site.URL,
		homepageHash: cachedHash,
		defaultHomepageID,
	} );

	const initialPage = pages?.find(
		( page ) => Number( page.value ) === Number( page_id || defaultHomepageID )
	);
	const [ currentPage, setCurrentPage ] = useState< PageReport | undefined >( initialPage );

	const {
		desktopReport,
		mobileReport,
		isLoading,
		isRunningDesktopReport,
		isRunningMobileReport,
		hash,
		isError,
		refetch,
	} = usePerformanceData( currentPage?.url, currentPage?.wpcom_performance_report_url?.hash );

	const handlePageChange = ( page_id: string | null | undefined ) => {
		const page = pages.find( ( page ) => page.value === page_id );

		setCurrentPage( page );
		refetch();
	};

	return (
		<PageLayout>
			<PageHeader
				title={ __( 'Performance' ) }
				actions={
					<>
						<PageSelectorWrapper
							siteId={ site.ID }
							currentPage={ currentPage }
							pages={ pages }
							onChange={ handlePageChange }
						/>
						<DeviceTabControls value={ deviceTab } onChange={ setDeviceTab } />
					</>
				}
			/>
			<Report
				isLoading={ isLoading }
				isRunningReport={ isRunningDesktopReport || isRunningMobileReport }
				isError={ isError }
				site={ site }
				report={ deviceTab === 'desktop' ? desktopReport : mobileReport }
				hash={ hash }
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
