export interface SiteHostingMetrics {
	message?: string;
	data: {
		_meta?: SiteHostingMetricsMetaData;
		periods: SiteHostingMetricsPeriodData[];
	};
}

export interface SiteHostingMetricsPeriodData {
	timestamp: number;
	dimension: { [ key: string ]: number };
}

export interface SiteHostingMetricsMetaData {
	start: number;
	end: number;
	resolution: number;
	metric: string;
	dimension: string;
	took: number;
}

export type SiteHostingMetricsDimension =
	| 'http_version'
	| 'http_verb'
	| 'http_host'
	| 'http_status'
	| 'page_renderer'
	| 'page_is_cached'
	| 'wp_admin_ajax_action'
	| 'visitor_asn'
	| 'visitor_country_code'
	| 'visitor_is_crawler';

export type SiteHostingMetricType =
	| 'requests_persec'
	| 'response_bytes_persec'
	| 'response_bytes_average'
	| 'response_time_average';

export interface SiteHostingMetricsParams {
	start: number;
	end: number;
	metric?: SiteHostingMetricType;
	dimension?: SiteHostingMetricsDimension;
}
