import { useSearch } from '@tanstack/react-router';
import { useState } from 'react';
import { sitePerformanceRoute } from '../../app/router/sites';
import { PerformanceProfilerDashboardContent } from './dashboard-content';
import ReportErrorNotice from './report-error-notice';
import ReportExpiredNotice from './report-expired-notice';
import type { PerformanceProfilerPage, PerformanceReport } from '@automattic/api-core';

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
	isError,
	onRetest,
}: {
	report: PerformanceReport | undefined;
	currentPage: PerformanceProfilerPage;
	isError: boolean;
	onRetest: () => void;
} ) {
	const { filter } = useSearch( { from: sitePerformanceRoute.fullPath } );
	const [ recommendationsFilter, setRecommendationsFilter ] = useState( filter );

	if ( isError ) {
		return <ReportErrorNotice onRetestClick={ onRetest } />;
	}

	if ( ! report ) {
		return null;
	}

	const handleRecommendationsFilterChange = ( filter: string ) => {
		setRecommendationsFilter( filter );
		updateUrl( filter );
	};

	return (
		<>
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
		</>
	);
}
