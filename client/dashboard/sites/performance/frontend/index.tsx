import { siteBySlugQuery, sitePerformancePagesQuery } from '@automattic/api-queries';
import config from '@automattic/calypso-config';
import { useQuery, useSuspenseQuery } from '@tanstack/react-query';
import { useNavigate, useSearch } from '@tanstack/react-router';
import { __experimentalHStack as HStack } from '@wordpress/components';
import { useEffect, useState, useMemo } from 'react';
import { useAnalytics } from '../../../app/analytics';
import { sitePerformanceFrontendRoute } from '../../../app/router/sites';
import { PageHeader } from '../../../components/page-header';
import PageLayout from '../../../components/page-layout';
import DeviceToggle from '../device-toggle';
import PageSelector from '../page-selector';
import Report from '../report';
import ReportErrorNotice from '../report-error-notice';
import ReportLoading from '../report-loading';
import ReportNoPagesNotice from '../report-no-pages-notice';
import Subtitle from '../subtitle';
import { useSitePerformanceData } from '../use-site-performance-data';
import type { DeviceToggleType } from '../types';
import type { SitePerformancePage } from '@automattic/api-core';

const getPageFromID = ( pages: SitePerformancePage[] | undefined, pageId: string ) => {
	return pages?.find( ( page: SitePerformancePage ) => Number( page.id ) === Number( pageId ) );
};

export default function SitePerformanceFrontend( { siteSlug }: { siteSlug: string } ) {
	const { data: site } = useSuspenseQuery( siteBySlugQuery( siteSlug ) );
	const [ deviceToggle, setDeviceToggle ] = useState< DeviceToggleType >( 'mobile' );
	const [ runNewReport, setRunNewReport ] = useState( false );

	const {
		data: pagesData,
		isLoading: isLoadingPages,
		refetch: refetchPages,
	} = useQuery( {
		...sitePerformancePagesQuery( site.ID ),
	} );
	const { page_id, url } = useSearch( { from: sitePerformanceFrontendRoute.fullPath } ) as {
		page_id?: string;
		url?: string;
	};

	const currentPage = useMemo( () => {
		if ( page_id ) {
			const foundPage = getPageFromID( pagesData, page_id );
			return foundPage || pagesData?.[ 0 ];
		}
		return pagesData?.[ 0 ];
	}, [ page_id, pagesData ] );

	const performanceUrl = [ 'development', 'wpcalypso' ].includes( config( 'env_id' ) )
		? url ?? currentPage?.link
		: currentPage?.link;

	const {
		hasError,
		createNewReport,
		isLoadingExistingReport,
		isLoadingNewReport,
		getReport,
		hasCompleted,
	} = useSitePerformanceData(
		performanceUrl,
		currentPage?.wpcom_performance_report_hash,
		runNewReport
	);
	const { recordTracksEvent } = useAnalytics();
	const navigate = useNavigate();

	const handleReportRefetch = async () => {
		setRunNewReport( true );
		await createNewReport();
		refetchPages();
	};

	useEffect( () => {
		if ( hasCompleted ) {
			setRunNewReport( false );
		}
	}, [ hasCompleted ] );

	const currentReport = getReport( deviceToggle );

	const renderContent = () => {
		if ( hasError( deviceToggle ) ) {
			return <ReportErrorNotice onRetestClick={ handleReportRefetch } />;
		}

		if ( isLoadingPages ) {
			return <ReportLoading isLoadingPages />;
		}

		if ( ! pagesData?.length || ! currentPage ) {
			return <ReportNoPagesNotice />;
		}

		if ( isLoadingNewReport( deviceToggle ) ) {
			return <ReportLoading isSavedReport={ false } />;
		}

		if ( isLoadingExistingReport( deviceToggle ) || ! currentReport ) {
			return <ReportLoading isSavedReport />;
		}

		return (
			<Report
				report={ currentReport }
				device={ deviceToggle }
				hash={ currentPage?.wpcom_performance_report_hash }
			/>
		);
	};

	return (
		<PageLayout
			header={
				<PageHeader
					description={
						<Subtitle timestamp={ currentReport?.timestamp } onClick={ handleReportRefetch } />
					}
					actions={
						<HStack>
							<PageSelector
								siteUrl={ site.URL }
								currentPage={ currentPage }
								pages={ pagesData || [] }
								onChange={ ( pageId ) => {
									setRunNewReport( false );
									recordTracksEvent(
										'calypso_dashboard_performance_profiler_page_selector_change',
										{
											is_home: pageId === '0',
										}
									);

									navigate( {
										to: `/sites/${ siteSlug }/performance/frontend`,
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
			}
		>
			{ renderContent() }
		</PageLayout>
	);
}
