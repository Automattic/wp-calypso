import { useSearch } from '@tanstack/react-router';
import { useState } from 'react';
import { PerformanceProfilerDashboardContent } from 'calypso/performance-profiler/components/dashboard-content';
import { sitePerformanceRoute } from '../../app/router';
import { ReportError } from './report-error';
import { ReportExpiredNotice } from './report-expired-notice';
import { ReportLoading } from './report-loading';
import type { PerformanceReport, ProfilerPage } from '../../data/types';

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
	report,
	currentPage,
	isFetchingReport,
	isError,
	isRunningReport,
	onRetest,
}: {
	report: PerformanceReport | undefined;
	currentPage: ProfilerPage;
	isFetchingReport: boolean;
	isError: boolean;
	isRunningReport: boolean;
	onRetest: () => void;
} ) {
	const { filter } = useSearch( { from: sitePerformanceRoute.fullPath } );
	const [ recommendationsFilter, setRecommendationsFilter ] = useState( filter );

	if ( isError ) {
		return <ReportError onRetestClick={ onRetest } />;
	}

	if ( isFetchingReport || isRunningReport ) {
		return (
			<ReportLoading pageTitle={ currentPage.title.rendered } isSavedReport={ isFetchingReport } />
		);
	}

	if ( ! report ) {
		return null;
	}

	const handleRecommendationsFilterChange = ( filter: string ) => {
		setRecommendationsFilter( filter );
		updateUrl( filter );
	};

	return (
		<div className="site-performance-report">
			<ReportExpiredNotice reportTimestamp={ report?.timestamp } onRetest={ onRetest } />
			<PerformanceProfilerDashboardContent
				performanceReport={ report }
				url={ currentPage.link }
				hash={ currentPage.wpcom_performance_report_hash }
				overallScoreIsTab
				filter={ recommendationsFilter }
				displayNewsletterBanner={ false }
				displayMigrationBanner={ false }
				onRecommendationsFilterChange={ handleRecommendationsFilterChange }
			/>
		</div>
	);
}
