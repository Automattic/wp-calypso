import { translate } from 'i18n-calypso';
import { useRef } from 'react';
import { PerformanceReport } from 'calypso/data/site-profiler/types';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { CoreWebVitalsDisplay } from 'calypso/performance-profiler/components/core-web-vitals-display';
import { Disclaimer } from 'calypso/performance-profiler/components/disclaimer-section';
import { TabType, TabTypes } from 'calypso/performance-profiler/components/header';
import { InsightsSection } from 'calypso/performance-profiler/components/insights-section';
import { MigrationBanner } from 'calypso/performance-profiler/components/migration-banner';
import { NewsletterBanner } from 'calypso/performance-profiler/components/newsletter-banner';
import { PerformanceScore } from 'calypso/performance-profiler/components/performance-score';
import { ScreenshotThumbnail } from 'calypso/performance-profiler/components/screenshot-thumbnail';
import { ScreenshotTimeline } from 'calypso/performance-profiler/components/screenshot-timeline';
import { useReportCompletedEffect } from 'calypso/performance-profiler/hooks/use-report-track-events-effect';
import './style.scss';

type PerformanceProfilerDashboardContentProps = {
	performanceReport: PerformanceReport;
	url: string;
	hash: string;
	filter?: string;
	displayThumbnail?: boolean;
	displayNewsletterBanner?: boolean;
	displayMigrationBanner?: boolean;
	activeTab?: TabType;
	overallScoreIsTab?: boolean;
	onRecommendationsFilterChange?: ( filter: string ) => void;
};

export const PerformanceProfilerDashboardContent = ( {
	performanceReport,
	url,
	hash,
	filter,
	displayNewsletterBanner = true,
	displayMigrationBanner = true,
	activeTab = TabTypes.mobile,
	overallScoreIsTab = false,
	onRecommendationsFilterChange,
}: PerformanceProfilerDashboardContentProps ) => {
	const {
		crux_score,
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

	useReportCompletedEffect( url, hash );

	return (
		<div className="performance-profiler-content">
			<div className="l-block-wrapper container">
				{ ! overallScoreIsTab && (
					<div className="top-section">
						<PerformanceScore
							value={ crux_score ? crux_score * 100 : overall_score * 100 }
							recommendationsQuantity={ Object.keys( audits ).length }
							recommendationsRef={ insightsRef }
						/>
						<ScreenshotThumbnail
							alt={ translate( 'Website thumbnail' ) }
							src={ screenshots?.[ screenshots.length - 1 ].data }
							activeTab={ activeTab }
						/>
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
					overallScoreIsTab={ overallScoreIsTab }
					history={ history }
					audits={ audits }
					recommendationsRef={ insightsRef }
					onRecommendationsFilterChange={ onRecommendationsFilterChange }
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
