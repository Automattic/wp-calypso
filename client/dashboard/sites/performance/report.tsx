import { useSearch } from '@tanstack/react-router';
import { useState } from 'react';
import { PerformanceProfilerDashboardContent } from 'calypso/performance-profiler/components/dashboard-content';
import { sitePerformanceRoute } from '../../app/router';
import { ReportError } from './report-error';
import { ReportExpiredNotice } from './report-expired-notice';
import { ReportLoading } from './report-loading';
import type { PerformanceProfilerPage } from '../../data';
import type { PerformanceReport } from '../../data/types';

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
	currentPage: PerformanceProfilerPage;
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

	// The PerformanceReport types used in the dashboard are incompatible, they have different
	// expectations for whether metric values are nullable.
	// TODO Reconcile the two types
	const { cls = 0, lcp = 0, fcp = 0, ttfb = 0, inp = 0, tbt = 0, overall = 0 } = report;
	const reportForDashboardContent = {
		...report,
		cls,
		lcp,
		fcp,
		ttfb,
		inp,
		tbt,
		overall,
	};

	return (
		<div className="site-performance-report">
			<ReportExpiredNotice reportTimestamp={ report?.timestamp } onRetest={ onRetest } />
			<PerformanceProfilerDashboardContent
				performanceReport={ reportForDashboardContent }
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
