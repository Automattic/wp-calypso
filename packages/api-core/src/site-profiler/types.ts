export interface BasicMetricsData {
	token?: string;
}

export interface PerformanceReport {
	audits: Record< string, any >;
	crux_score: number;
	performance: number;
	overall_score: number;
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
		metrics: {
			ttfb?: number[];
			fcp?: number[];
			lcp?: number[];
			cls?: number[];
			inp?: number[];
			tbt?: number[];
			overall?: number[];
		};
	};
	timestamp?: string;
	share_link: string;
	cls: number;
	lcp: number;
	fcp: number;
	ttfb: number;
	inp: number;
	tbt: number;
	overall: number;
}

export interface PerformanceProfilerPage {
	id: string;
	link: string;
	title: { rendered: string };
	wpcom_performance_report_hash: string;
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
