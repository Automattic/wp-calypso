import { translate } from 'i18n-calypso';
import { PerformanceReport } from 'calypso/data/site-profiler/types';
import { CoreWebVitalsDisplay } from 'calypso/performance-profiler/components/core-web-vitals-display';
import { Disclaimer } from 'calypso/performance-profiler/components/disclaimer-section';
import { InsightsSection } from 'calypso/performance-profiler/components/insights-section';
import { MigrationBanner } from 'calypso/performance-profiler/components/migration-banner';
import { PerformanceScore } from 'calypso/performance-profiler/components/performance-score';
import { ScreenshotThumbnail } from 'calypso/performance-profiler/components/screenshot-thumbnail';
import { ScreenshotTimeline } from 'calypso/performance-profiler/components/screenshot-timeline';
import './style.scss';

type PerformanceProfilerDashboardContentProps = {
	performanceReport: PerformanceReport;
	url: string;
};

export const PerformanceProfilerDashboardContent = ( {
	performanceReport,
	url,
}: PerformanceProfilerDashboardContentProps ) => {
	const { overall_score, fcp, lcp, cls, inp, ttfb, audits, history, screenshots } =
		performanceReport;

	return (
		<div className="performance-profiler-content">
			<div className="l-block-wrapper container">
				<div className="top-section">
					<PerformanceScore value={ overall_score * 100 } />
					<ScreenshotThumbnail
						alt={ translate( 'Website thumbnail' ) }
						src={ screenshots?.[ screenshots.length - 1 ].data }
					/>
				</div>
				<CoreWebVitalsDisplay
					fcp={ fcp }
					lcp={ lcp }
					cls={ cls }
					inp={ inp }
					ttfb={ ttfb }
					history={ history }
				/>
				<ScreenshotTimeline screenshots={ screenshots ?? [] } />
				{ audits && <InsightsSection audits={ audits } /> }
			</div>

			<Disclaimer />
			<MigrationBanner url={ url } />
		</div>
	);
};
