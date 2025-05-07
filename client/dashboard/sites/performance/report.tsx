import { useSearch } from '@tanstack/react-router';
import { useState } from 'react';
import { PerformanceProfilerDashboardContent } from 'calypso/performance-profiler/components/dashboard-content';
import { sitePerformanceRoute } from '../../app/router';
import { usePerformanceData } from '../hooks/use-performance-data';
import type { TabType } from './device-tabs';
import type { Site } from '../../data/types';
import { ReportLoading } from './report-loading';
import { ExpiredReportNotice } from './expired-report-notice';
import { ReportError } from './report-error';

import './style.scss';

const updateUrl = ( filter?: string ) => {
	const url = new URL( window.location.href );
	if ( filter ) {
		url.searchParams.set( 'filter', filter );
	} else {
		url.searchParams.delete( 'filter' );
	}
	window.history.replaceState( {}, '', url.toString() );
};

export default function Report( { site, deviceType }: { site: Site; deviceType: TabType } ) {
	const { filter } = useSearch( { from: sitePerformanceRoute.fullPath } );
	const [ recommendationsFilter, setRecommendationsFilter ] = useState( filter );
	const {
		desktopReport,
		mobileReport,
		isLoading,
		isRunningDesktopReport,
		isRunningMobileReport,
		hash,
		isError,
	} = usePerformanceData( site.ID, site.URL );
	const isSitePublic = site && site.options?.blog_public === 1;

	const handleRecommendationsFilterChange = ( filter?: string ) => {
		setRecommendationsFilter( filter );
		updateUrl();
	};

	const report = deviceType === 'desktop' ? desktopReport : mobileReport;

	if ( ! isSitePublic ) {
		return 'This site is not public. Please make it public to view the performance report.';
	}

	if ( isLoading ) {
		return 'loading...';
	}

	if ( isRunningDesktopReport || isRunningMobileReport ) {
		return <ReportLoading pageTitle="" isSavedReport={ false } />;
	}

	if ( isError ) {
		return <ReportError onRetestClick={ () => {} } />;
	}

	if ( ! report || ! hash ) {
		return 'no report';
	}

	return (
		<div className="site-performance-report">
			<ExpiredReportNotice reportTimestamp={ report?.timestamp } onRetest={ () => {} } />
			<PerformanceProfilerDashboardContent
				performanceReport={ report }
				url={ site.URL }
				hash={ hash }
				overallScoreIsTab
				filter={ recommendationsFilter }
				displayNewsletterBanner={ false }
				displayMigrationBanner={ false }
				onRecommendationsFilterChange={ handleRecommendationsFilterChange }
			/>
		</div>
	);
}
