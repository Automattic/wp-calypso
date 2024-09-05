import { translate } from 'i18n-calypso';
import { PerformanceReport } from 'calypso/data/site-profiler/types';
import { CoreWebVitalsDisplay } from 'calypso/performance-profiler/components/core-web-vitals-display';
import { Disclaimer } from 'calypso/performance-profiler/components/disclaimer-section';
import { InsightsSection } from 'calypso/performance-profiler/components/insights-section';
import { MigrationBanner } from 'calypso/performance-profiler/components/migration-banner';
import { NewsletterBanner } from 'calypso/performance-profiler/components/newsletter-banner';
import { PerformanceScore } from 'calypso/performance-profiler/components/performance-score';
import { ScreenshotThumbnail } from 'calypso/performance-profiler/components/screenshot-thumbnail';
import { ScreenshotTimeline } from 'calypso/performance-profiler/components/screenshot-timeline';
import './style.scss';

type PerformanceProfilerDashboardContentProps = {
	performanceReport: PerformanceReport;
	url: string;
	hash: string;
};

export const PerformanceProfilerDashboardContent = ( {
	performanceReport,
	url,
	hash,
}: PerformanceProfilerDashboardContentProps ) => {
	const { overall_score, fcp, lcp, cls, inp, ttfb, tbt, audits, history, screenshots, is_wpcom } =
		performanceReport;

	return (
		<div className="performance-profiler-content">
			<div className="l-block-wrapper container">
				<div className="top-section">
					<PerformanceScore
						value={ overall_score * 100 }
						recommendationsQuantity={ Object.keys( audits ).length }
					/>
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
					tbt={ tbt }
					history={ history }
				/>
				<NewsletterBanner link={ `/speed-test-tool/weekly-report?url=${ url }&hash=${ hash }` } />
				<ScreenshotTimeline screenshots={ screenshots ?? [] } />
				{ audits && <InsightsSection audits={ audits } url={ url } isWpcom={ is_wpcom } /> }
			</div>

			<Disclaimer />
			<MigrationBanner url={ url } />
		</div>
	);
};
