export interface BasicMetricsData {
	token?: string;
}

export interface PerformanceReport {
	audits: Record< string, unknown >;
	overall_score: number;
	timestamp: string;
}

export interface UrlPerformanceInsights {
	pagespeed: {
		status: string;
		mobile: PerformanceReport | string;
		desktop: PerformanceReport | string;
	};
	wpscan: {
		status: string;
	};
}
