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
	onRetestClick(): void;
	pageTitle: string;
	filter?: string;
	onFilterChange?( fitler: string ): void;
}

export const PerformanceReport = ( {
	isLoading,
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

	if ( isLoading ) {
		return <PerformanceReportLoading isSavedReport pageTitle={ pageTitle } />;
	}

	if ( ! performanceReport ) {
		return null;
	}

	return (
		<PerformanceProfilerDashboardContent
			performanceReport={ performanceReport }
			url={ url }
			hash={ hash }
			showV2
			filter={ filter }
			displayThumbnail={ false }
			displayNewsletterBanner={ false }
			displayMigrationBanner={ false }
			onRecommendationsFilterChange={ onFilterChange }
		/>
	);
};
