import { useRef } from 'react';
import { PerformanceReport } from 'calypso/data/site-profiler/types';
import { CoreWebVitalsDisplay } from 'calypso/performance-profiler/components/core-web-vitals-display';
import { Disclaimer } from 'calypso/performance-profiler/components/disclaimer-section';
import { InsightsSection } from 'calypso/performance-profiler/components/insights-section';
import { ScreenshotTimeline } from 'calypso/performance-profiler/components/screenshot-timeline';
import './style.scss';

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
