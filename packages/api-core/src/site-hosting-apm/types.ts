export type ApmTransactionType = 'db' | 'wp_core' | 'plugin' | 'external';

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

export interface ApmTransaction {
	type: ApmTransactionType;
	name: string;
	duration_ms: number;
	start_offset_ms: number;
}

export interface ApmRequestDetail extends ApmSlowRequest {
	transactions: ApmTransaction[];
}

export interface ApmOverview {
	timeseries: ApmTimePoint[];
	slow_requests: ApmSlowRequest[];
}
