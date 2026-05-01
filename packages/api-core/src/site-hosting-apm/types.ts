export interface ApmTimePoint {
	timestamp: number;
	db: number;
	wp_core: number;
	plugins: number;
	external: number;
}

export interface ApmSlowRequest {
	id: string;
	url: string;
	method: string;
	duration_ms: number;
	status: number;
	timestamp: number;
}

export type ApmRequestDetail = ApmSlowRequest;

export interface ApmOverview {
	timeseries: ApmTimePoint[];
	slow_requests: ApmSlowRequest[];
}
