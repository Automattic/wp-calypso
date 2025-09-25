import { useSearch } from '@tanstack/react-router';
import { useState, useRef } from 'react';
import { sitePerformanceRoute } from '../../app/router/sites';
import { CoreWebVitalsDisplay } from './core-web-vitals';
import Disclaimer from './disclaimer';
import InsightsSection from './insight-section';
import ReportErrorNotice from './report-error-notice';
import ReportExpiredNotice from './report-expired-notice';
import ScreenshotTimeline from './screenshot-timeline';
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
	const insightsRef = useRef< HTMLDivElement >( null );

	const {
		overall_score,
		fcp,
		lcp,
		cls,
		inp,
		ttfb,
		tbt,
		audits,
		history,
		screenshots,
		is_wpcom,
		fullPageScreenshot,
	} = report || {};

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

			<CoreWebVitalsDisplay
				fcp={ fcp }
				lcp={ lcp }
				cls={ cls }
				inp={ inp }
				ttfb={ ttfb }
				tbt={ tbt }
				overall={ overall_score * 100 }
				overallScoreIsTab={ false }
				history={ history }
				audits={ audits }
				recommendationsRef={ insightsRef }
				onRecommendationsFilterChange={ handleRecommendationsFilterChange }
			/>

			<ScreenshotTimeline screenshots={ screenshots ?? [] } />

			{ audits && (
				<InsightsSection
					fullPageScreenshot={ fullPageScreenshot }
					audits={ audits }
					url={ currentPage.link }
					isWpcom={ is_wpcom }
					ref={ insightsRef }
					hash={ currentPage.wpcom_performance_report_hash }
					filter={ recommendationsFilter }
					onRecommendationsFilterChange={ handleRecommendationsFilterChange }
				/>
			) }

			<Disclaimer />
		</>
	);
}
