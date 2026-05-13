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
	slow_request_count: number;
	transaction_count: number;
	db_avg_ms: number;
	external_avg_ms: number;
}

export interface ApmOverview {
	summary: ApmSummary;
	timeseries: ApmTimePoint[];
	slow_requests: ApmSlowRequest[];
}
