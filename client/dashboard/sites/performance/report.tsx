import { useSearch } from '@tanstack/react-router';
import { useState } from 'react';
import { PerformanceProfilerDashboardContent } from 'calypso/performance-profiler/components/dashboard-content';
import { sitePerformanceRoute } from '../../app/router';
import { ReportError } from './report-error';
import { ReportExpiredNotice } from './report-expired-notice';
import { ReportLoading } from './report-loading';
import type { PerformanceReport, Site } from '../../data/types';

import './style.scss';

const updateUrl = ( filter: string | undefined ) => {
	const url = new URL( window.location.href );
	if ( filter ) {
		url.searchParams.set( 'filter', filter );
	} else {
		url.searchParams.delete( 'filter' );
	}

	window.history.replaceState( {}, '', url.toString() );
};

export default function Report( {
	site,
	report,
	hash,
	isLoading,
	isRunningReport,
	isError,
}: {
	site: Site;
	report: PerformanceReport;
	hash: string;
	isLoading: boolean;
	isRunningReport: boolean;
	isError: boolean;
} ) {
	const { filter } = useSearch( { from: sitePerformanceRoute.fullPath } );
	const [ recommendationsFilter, setRecommendationsFilter ] = useState( filter );
	const isSitePublic = site && site.options?.blog_public === 1;

	const handleRecommendationsFilterChange = ( filter: string ) => {
		setRecommendationsFilter( filter );
		updateUrl( filter );
	};

	if ( ! isSitePublic ) {
		return 'This site is not public. Please make it public to view the performance report.';
	}

	if ( isLoading ) {
		return 'loading...';
	}

	if ( isRunningReport ) {
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
			<ReportExpiredNotice reportTimestamp={ report?.timestamp } onRetest={ () => {} } />
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
