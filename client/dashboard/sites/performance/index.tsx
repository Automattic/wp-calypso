import {
	siteBySlugQuery,
	sitePerformancePagesQuery,
	siteSettingsQuery,
} from '@automattic/api-queries';
import config from '@automattic/calypso-config';
import { useQuery, useSuspenseQuery } from '@tanstack/react-query';
import { useNavigate, useSearch } from '@tanstack/react-router';
import { __experimentalHStack as HStack } from '@wordpress/components';
import { createInterpolateElement } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { useEffect, useState, useMemo } from 'react';
import { useAnalytics } from '../../app/analytics';
import { sitePerformanceRoute, siteRoute } from '../../app/router/sites';
import InlineSupportLink from '../../components/inline-support-link';
import { Notice } from '../../components/notice';
import { PageHeader } from '../../components/page-header';
import PageLayout from '../../components/page-layout';
import HostingFeatureGatedWithCallout from '../hosting-feature-gated-with-callout';
import { SiteLaunchButton } from '../site-launch-button';
import DeviceToggle from './device-toggle';
import PageSelector from './page-selector';
import { getPerformanceCalloutProps } from './performance-callout';
import Report from './report';
import ReportErrorNotice from './report-error-notice';
import ReportExpiredNotice from './report-expired-notice';
import ReportLoading from './report-loading';
import ReportNoPagesNotice from './report-no-pages-notice';
import Subtitle from './subtitle';
import { useSitePerformanceData } from './use-site-performance-data';
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
	const [ deviceToggle, setDeviceToggle ] = useState< DeviceToggleType >( 'mobile' );
	const [ runNewReport, setRunNewReport ] = useState( false );

	const { data: siteSettings } = useSuspenseQuery( {
		...siteSettingsQuery( site.ID ),
		select: ( s ) => ( {
			gmtOffset: Number( s?.gmt_offset ) || 0,
			timezoneString: s?.timezone_string || undefined,
		} ),
	} );
	const {
		data: pagesData,
		isLoading: isLoadingPages,
		refetch: refetchPages,
	} = useQuery( {
		...sitePerformancePagesQuery( site.ID ),
	} );
	const { page_id, url } = useSearch( { from: sitePerformanceRoute.fullPath } ) as {
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
	const navigate = useNavigate( { from: sitePerformanceRoute.fullPath } );

	const handleReportRefetch = async () => {
		setRunNewReport( true );
		await createNewReport();
		// Once we get a token back, we can refetch the pages to get the updated hash.
		refetchPages();
	};

	useEffect( () => {
		if ( hasCompleted ) {
			setRunNewReport( false );
		}
	}, [ hasCompleted ] );

	const currentReport = getReport( deviceToggle );
	const { gmtOffset, timezoneString } = siteSettings;

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

		// Our default loading state is loading the existing report.
		if ( isLoadingExistingReport( deviceToggle ) || ! currentReport ) {
			return <ReportLoading isSavedReport />;
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
		<PageLayout
			header={
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

function SitePerformance() {
	const { siteSlug } = siteRoute.useParams();
	const { data: site } = useSuspenseQuery( siteBySlugQuery( siteSlug ) );

	return (
		<HostingFeatureGatedWithCallout
			site={ site }
			overlay={ <PageLayout header={ <PageHeader /> } /> }
			{ ...getPerformanceCalloutProps() }
		>
			{ site.is_coming_soon || site.is_private ? (
				<PageLayout
					size="small"
					header={
						<PageHeader
							description={ createInterpolateElement(
								__(
									'Optimize your site for lightning-fast performance. <learnMoreLink>Learn more</learnMoreLink>'
								),
								{
									learnMoreLink: <InlineSupportLink supportContext="site-performance" />,
								}
							) }
						/>
					}
					notices={
						<Notice
							title={ __( 'Launch your site to start measuring performance' ) }
							actions={ <SiteLaunchButton site={ site } tracksContext="site_performance" /> }
						>
							{ __( 'Performance statistics are only available for public sites.' ) }
						</Notice>
					}
				/>
			) : (
				<SitePerformanceContent site={ site } />
			) }
		</HostingFeatureGatedWithCallout>
	);
}

export default SitePerformance;
