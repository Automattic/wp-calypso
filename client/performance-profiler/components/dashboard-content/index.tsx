import { translate } from 'i18n-calypso';
import { useRef } from 'react';
import { PerformanceReport } from 'calypso/data/site-profiler/types';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
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
	filter?: string;
	displayThumbnail?: boolean;
	displayNewsletterBanner?: boolean;
	displayMigrationBanner?: boolean;
	showV2?: boolean;
};

export const PerformanceProfilerDashboardContent = ( {
	performanceReport,
	url,
	hash,
	filter,
	displayThumbnail = true,
	displayNewsletterBanner = true,
	displayMigrationBanner = true,
	showV2 = false,
}: PerformanceProfilerDashboardContentProps ) => {
	const { overall_score, fcp, lcp, cls, inp, ttfb, tbt, audits, history, screenshots, is_wpcom } =
		performanceReport;
	const insightsRef = useRef< HTMLDivElement >( null );

	return (
		<div className="performance-profiler-content">
			<div className="l-block-wrapper container">
				{ ! showV2 && (
					<div className="top-section">
						<PerformanceScore
							value={ overall_score * 100 }
							recommendationsQuantity={ Object.keys( audits ).length }
							recommendationsRef={ insightsRef }
						/>
						{ displayThumbnail && (
							<ScreenshotThumbnail
								alt={ translate( 'Website thumbnail' ) }
								src={ screenshots?.[ screenshots.length - 1 ].data }
							/>
						) }
					</div>
				) }
				<CoreWebVitalsDisplay
					fcp={ fcp }
					lcp={ lcp }
					cls={ cls }
					inp={ inp }
					ttfb={ ttfb }
					tbt={ tbt }
					overall={ overall_score * 100 }
					showV2={ showV2 }
					history={ history }
					audits={ audits }
					recommendationsRef={ insightsRef }
				/>

				{ displayNewsletterBanner && (
					<NewsletterBanner
						link={ `/speed-test-tool/weekly-report?url=${ url }&hash=${ hash }` }
						onClick={ () => {
							recordTracksEvent( 'calypso_performance_profiler_weekly_report_cta_click', {
								url,
							} );
						} }
					/>
				) }

				<ScreenshotTimeline screenshots={ screenshots ?? [] } />
				{ audits && (
					<InsightsSection
						audits={ audits }
						url={ url }
						isWpcom={ is_wpcom }
						ref={ insightsRef }
						hash={ hash }
						filter={ filter }
					/>
				) }
			</div>

			<Disclaimer />
			{ displayMigrationBanner && (
				<MigrationBanner
					url={ url }
					onClick={ () => {
						recordTracksEvent( 'calypso_performance_profiler_migration_banner_cta_click', {
							url,
						} );
					} }
				/>
			) }
		</div>
	);
};
