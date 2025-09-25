import { useRef } from 'react';
import { CoreWebVitalsDisplay } from '../../../dashboard/sites/performance/core-web-vitals';
import Disclaimer from '../../../dashboard/sites/performance/disclaimer';
import InsightsSection from '../../../dashboard/sites/performance/insight-section';
import ScreenshotTimeline from '../../../dashboard/sites/performance/screenshot-timeline';
import type { PerformanceReport } from '@automattic/api-core';

type PerformanceProfilerDashboardContentProps = {
	performanceReport: PerformanceReport;
	url: string;
	hash: string;
	filter?: string;
	onRecommendationsFilterChange?: ( filter: string ) => void;
};

export const PerformanceProfilerDashboardContent = ( {
	performanceReport,
	url,
	hash,
	filter,
	onRecommendationsFilterChange,
}: PerformanceProfilerDashboardContentProps ) => {
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
	} = performanceReport;
	const insightsRef = useRef< HTMLDivElement >( null );

	return (
		<div className="performance-profiler-content">
			<div className="l-block-wrapper container">
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
					onRecommendationsFilterChange={ onRecommendationsFilterChange }
				/>
				<ScreenshotTimeline screenshots={ screenshots ?? [] } />
				{ audits && (
					<InsightsSection
						fullPageScreenshot={ fullPageScreenshot }
						audits={ audits }
						url={ url }
						isWpcom={ is_wpcom }
						ref={ insightsRef }
						hash={ hash }
						filter={ filter }
						onRecommendationsFilterChange={ onRecommendationsFilterChange }
					/>
				) }
			</div>
			<Disclaimer />
		</div>
	);
};
