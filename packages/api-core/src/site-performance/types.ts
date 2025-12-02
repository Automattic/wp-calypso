export interface BasicMetricsData {
	token?: string;
}

export type Metrics = 'cls' | 'lcp' | 'fcp' | 'ttfb' | 'inp' | 'tbt' | 'overall_score';

export type SitePerformanceHistory = {
	collection_period: Array< string | { year: number; month: number; day: number } >;
	metrics: Partial< Record< Metrics, number[] > >;
};

type PerformanceMetricAuditDetailsHeading = {
	key: string;
	label: string;
	valueType: string;
	subItemsHeading?: { key: string; valueType?: string };
};

type PerformanceMetricAuditDetailsItemObject = {
	location?: {
		url: string;
		line: number;
		column: number;
	};
} & Record< string, string | number >;

type PerformanceMetricAuditDetailsSubItemObject = {
	items: Record< string, string | number >[];
	type: 'subitems';
} & Record< string, string | number >;

export type PerformanceMetricAuditDetailsItem = {
	subItems?: PerformanceMetricAuditDetailsSubItemObject;
} & Record<
	string,
	| string
	| number
	| boolean
	| PerformanceMetricAuditDetailsItemObject
	| PerformanceMetricAuditDetailsSubItemObject
>;

export interface PerformanceMetricAuditDetails {
	type: 'table' | 'opportunity' | 'list' | 'criticalrequestchain';
	headings?: PerformanceMetricAuditDetailsHeading[];
	items?: PerformanceMetricAuditDetailsItem[];
	chains?: Record< string, unknown >[];
	isEntityGrouped?: boolean;
}

export type PerformanceMetricAudit = {
	id: string;
	title?: string;
	description?: string;
	type: 'warning' | 'fail';
	displayValue?: string;
	details?: PerformanceMetricAuditDetails;
	metricSavings?: { FCP?: number; LCP?: number; CLS?: number; INP?: number };
};

export type SitePerformanceReport = {
	audits: Record< string, PerformanceMetricAudit >;
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
	history?: SitePerformanceHistory;
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
