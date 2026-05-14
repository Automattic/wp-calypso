export interface SitePerformancePage {
	id: string;
	link: string;
	title: { rendered: string } | null;
	wpcom_performance_report_hash: string;
}
