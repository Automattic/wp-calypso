import { UrlData } from 'calypso/blocks/import/types';

export interface DNS {
	host: string;
	class: string;
	ttl: number;
	type: string;
	ip?: string;
	target?: string;
	mname?: string;
	rname?: string;
	serial?: number;
	refresh?: number;
	retry?: number;
	expire?: number;
	'minimum-ttl'?: number;
}

export interface WhoIs {
	admin_city?: string;
	admin_country?: string;
	admin_email?: string;
	admin_name?: string;
	admin_organization?: string;
	admin_phone?: string;
	admin_postal_code?: string;
	admin_state?: string;
	admin_street?: string | string[];
	creation_date?: string;
	domain_name?: string;
	name_server?: string | string[];
	registrant_city?: string;
	registrant_country?: string;
	registrant_email?: string;
	registrant_name?: string;
	registrant_organization?: string;
	registrant_phone?: string;
	registrant_postal_code?: string;
	registrant_state?: string;
	registrant_street?: string | string[];
	registrar?: string | string[];
	registrar_iana_id?: string;
	registrar_url?: string;
	registrar_whois_server?: string;
	registry_domain_id?: string;
	registry_expiry_date?: string;
	reseller?: string;
	status?: string;
	tech_city?: string;
	tech_country?: string;
	tech_email?: string;
	tech_name?: string;
	tech_organization?: string;
	tech_phone?: string;
	tech_postal_code?: string;
	tech_state?: string;
	tech_street?: string | string[];
	updated_date?: string;
}

export interface HostingProvider {
	slug: string;
	name: string;
	is_cdn: boolean;
	support_url?: string;
	homepage_url?: string;
}

export interface HostingProviderUrlDetails {
	name: string;
	is_a8c: boolean;
	is_unknown: boolean;
	hosting_provider?: HostingProvider;
	url_data?: UrlData;
}

export interface DomainAnalyzerQueryResponse {
	domain: string;
	whois: WhoIs;
	dns: DNS[];
	is_domain_available: boolean;
	eligible_google_transfer: boolean;
}

export interface DomainAnalyzerWhoisRawDataQueryResponse {
	domain: string;
	whois: string[];
}

export interface HostingProviderQueryResponse {
	domain: string;
	hosting_provider: HostingProvider;
}

export type Metrics = 'cls' | 'lcp' | 'fcp' | 'ttfb' | 'inp';

export type Scores = 'good' | 'needs-improvement' | 'poor';

export type BasicMetrics = Record< Metrics, number >;
export type BasicMetricsList = [ Metrics, number ][];

export type BasicMetricsScored = Record< string, { value: number; score: Scores } >;
export type BasicMetricsScoredList = [ Metrics, { value: number; score: Scores } ][];

export interface UrlBasicMetricsQueryResponse {
	final_url: string;
	basic: {
		data: BasicMetrics;
		success: boolean;
	};
	advanced: Record< string, string >;
	token: string;
}

export interface UrlSecurityMetricsQueryResponse {
	wpscan: {
		report: {
			audits: {
				pass: Record< string, PerformanceMetricsItemQueryResponse >;
				fail: Record< string, PerformanceMetricsItemQueryResponse >;
				truncated: boolean;
			};
			ovc: number;
		};
		status: string;
		errors: Record< string, Array< string > >;
	};
}

export type ScreenShotsTimeLine = {
	data: string;
	timing: number;
};

export type PerformanceMetricsHistory = {
	collection_period: string[];
	metrics: {
		ttfb?: number[];
		fcp?: number[];
		lcp?: number[];
		cls?: number[];
		inp?: number[];
	};
};

export type PerformanceReport = {
	audits: Record< string, PerformanceMetricsItemQueryResponse >;
	performance: number;
	overall_score: number;
	is_wpcom: boolean;
	is_wordpress: boolean;
	screenshots?: ScreenShotsTimeLine[];
	history: PerformanceMetricsHistory;
	timestamp?: string;
} & BasicMetrics;

export interface UrlPerformanceMetricsQueryResponse {
	webtestpage_org: {
		report: PerformanceReport;
		status: string;
	};
}

export interface UrlPerformanceInsightsQueryResponse {
	pagespeed: {
		status: string;
		mobile: PerformanceReport | string;
		desktop: PerformanceReport | string;
	};
}

export interface PerformanceMetricsDataQueryResponse {
	diagnostic: Record< string, PerformanceMetricsItemQueryResponse >;
	pass: Record< string, PerformanceMetricsItemQueryResponse >;
	truncated: boolean;
}

export interface PerformanceMetricsItemQueryResponse {
	id: string;
	title?: string;
	description?: string;
	displayValue?: string;
	details?: PerformanceMetricsDetailsQueryResponse;
}

export interface PerformanceMetricsDetailsQueryResponse {
	type: 'table' | 'opportunity' | 'list' | 'criticalrequestchain';
	headings?: Array< { key: string; label: string; valueType: string } >;
	items?: Array< {
		[ key: string ]: string | number | { [ key: string ]: any };
	} >;
	chains?: Array< { [ key: string ]: any } >;
}

export interface BasicMetricsResult extends Omit< UrlBasicMetricsQueryResponse, 'basic' > {
	basic: BasicMetricsScored;
}

export type PerformanceCategories =
	| 'wpcom-low-performer'
	| 'wpcom-high-performer'
	| 'non-wpcom-low-performer'
	| 'non-wpcom-high-performer';
