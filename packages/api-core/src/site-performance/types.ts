export interface BasicMetricsData {
	token?: string;
}

export type Metrics = 'cls' | 'lcp' | 'fcp' | 'ttfb' | 'inp' | 'tbt' | 'overall_score';

export type SitePerformanceReport = {
	audits: Record< string, any >;
	crux_score: number;
	performance: number;
	fullPageScreenshot: {
		screenshot: {
			data: string;
			height: number;
			width: number;
		};
		nodes: Record< string, any >;
	};
	is_wpcom: boolean;
	is_wordpress: boolean;
	screenshots?: Array< { data: string; timing: number } >;
	history: {
		collection_period: Array< string | { year: number; month: number; day: number } >;
		metrics: Partial< Record< Metrics, number[] > >;
	};
	timestamp?: string;
	share_link: string;
} & Record< Metrics, number >;

export interface SitePerformanceInsights {
	pagespeed: {
		status: string;
		mobile: SitePerformanceReport;
		desktop: SitePerformanceReport;
	};
	wpscan: {
		status: string;
	};
}
