import { useUrlBasicMetricsQuery } from 'calypso/data/site-profiler/use-url-basic-metrics-query';
import { useUrlPerformanceInsightsQuery } from 'calypso/data/site-profiler/use-url-performance-insights';
import { PerformanceProfilerDashboardContent } from 'calypso/performance-profiler/components/dashboard-content';
import { Tab } from './device-tab-control';

interface PerformanceReportProps {
	wpcom_performance_url?: { url: string; hash: string };
	activeTab: Tab;
}

export const PerformanceReport = ( {
	wpcom_performance_url,
	activeTab,
}: PerformanceReportProps ) => {
	const { url = '', hash = '' } = wpcom_performance_url || {};

	const { data: basicMetrics } = useUrlBasicMetricsQuery( url, hash, true );
	const { final_url: finalUrl } = basicMetrics || {};
	const { data: performanceInsights } = useUrlPerformanceInsightsQuery( url, hash );

	const mobileReport =
		typeof performanceInsights?.mobile === 'string' ? undefined : performanceInsights?.mobile;
	const desktopReport =
		typeof performanceInsights?.desktop === 'string' ? undefined : performanceInsights?.desktop;

	const performanceReport = activeTab === 'mobile' ? mobileReport : desktopReport;

	if ( ! performanceReport ) {
		return null;
	}

	return (
		<PerformanceProfilerDashboardContent
			performanceReport={ performanceReport }
			url={ finalUrl ?? url }
			hash={ hash }
			displayThumbnail={ false }
			displayNewsletterBanner={ false }
			displayMigrationBanner={ false }
		/>
	);
};
