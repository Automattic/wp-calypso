export interface ApmTimePoint {
	timestamp: number;
	db: number;
	wp_core: number;
	plugins: number;
	external: number;
	cache: number;
}

export interface ApmSlowRequest {
	id: string;
	url: string;
	method: string;
	avg_duration_ms: number;
	duration_ms: number;
	status: number;
	timestamp: number;
}

export type ApmRequestDetail = ApmSlowRequest;

export interface ApmSummary {
	avg_response_ms: number;
	transaction_count: number;
	db_avg_ms: number;
	external_avg_ms: number;
	plugins_avg_ms: number;
}

export interface ApmOverview {
	summary: ApmSummary;
	timeseries: ApmTimePoint[];
	slow_requests: ApmSlowRequest[];
}

export interface ApmPluginUsage {
	slug: string;
	name: string;
	total_ms: number;
	avg_ms: number;
	call_count: number;
}

export interface ApmHookUsage {
	name: string;
	total_ms: number;
	avg_ms: number;
	call_count: number;
}

export interface ApmTemplateUsage {
	template: string;
	total_ms: number;
	avg_ms: number;
	hit_count: number;
}

export interface ApmWordPress {
	plugins: ApmPluginUsage[];
	hooks: ApmHookUsage[];
	templates: ApmTemplateUsage[];
}

export interface ApmTransaction {
	method: string;
	url: string;
	avg_ms: number;
	max_ms: number;
	call_count: number;
	total_ms: number;
}

export interface ApmSlowQuery {
	id: string;
	query: string;
	avg_ms: number;
	max_ms: number;
	call_count: number;
	total_ms: number;
}

export interface ApmExternalRequest {
	host: string;
	endpoint: string;
	method: string;
	avg_ms: number;
	max_ms: number;
	call_count: number;
	total_ms: number;
}
