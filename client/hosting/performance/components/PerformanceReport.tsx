import { PerformanceReport as PerformanceReportObject } from 'calypso/data/site-profiler/types';
import { PerformanceProfilerDashboardContent } from 'calypso/performance-profiler/components/dashboard-content';
import { PerformanceReportLoading } from './PerformanceReportLoading';

interface PerformanceReportProps {
	performanceReport?: PerformanceReportObject;
	url: string;
	hash: string;
	isLoading: boolean;
	pageTitle: string;
}

export const PerformanceReport = ( {
	isLoading,
	performanceReport,
	url,
	hash,
	pageTitle,
}: PerformanceReportProps ) => {
	if ( isLoading ) {
		return <PerformanceReportLoading isSavedReport={ !! hash } pageTitle={ pageTitle } />;
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
			displayThumbnail={ false }
			displayNewsletterBanner={ false }
			displayMigrationBanner={ false }
		/>
	);
};
