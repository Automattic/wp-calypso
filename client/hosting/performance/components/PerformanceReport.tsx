import { PerformanceReport as PerformanceReportObject } from 'calypso/data/site-profiler/types';
import { PerformanceProfilerDashboardContent } from 'calypso/performance-profiler/components/dashboard-content';
import { PerformanceReportLoading } from './PerformanceReportLoading';
import { ReportError } from './ReportError';

interface PerformanceReportProps {
	performanceReport?: PerformanceReportObject;
	url: string;
	hash: string;
	isLoading: boolean;
	isError: boolean;
	isRetesting: boolean;
	onRetestClick(): void;
	pageTitle: string;
	filter?: string;
	onFilterChange?( fitler: string ): void;
}

export const PerformanceReport = ( {
	isLoading,
	isRetesting,
	isError,
	onRetestClick,
	performanceReport,
	url,
	hash,
	pageTitle,
	filter,
	onFilterChange,
}: PerformanceReportProps ) => {
	if ( isError ) {
		return <ReportError onRetestClick={ onRetestClick } />;
	}

	if ( isRetesting || isLoading ) {
		return (
			<PerformanceReportLoading
				isSavedReport={ ! isRetesting && !! hash }
				pageTitle={ pageTitle }
			/>
		);
	}

	if ( ! performanceReport ) {
		return null;
	}

	return (
		<PerformanceProfilerDashboardContent
			performanceReport={ performanceReport }
			url={ url }
			hash={ hash }
			overallScoreIsTab
			filter={ filter }
			displayNewsletterBanner={ false }
			displayMigrationBanner={ false }
			onRecommendationsFilterChange={ onFilterChange }
		/>
	);
};
