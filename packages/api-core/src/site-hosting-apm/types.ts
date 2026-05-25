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

export interface ApmAggregateParams {
	start?: number;
	end?: number;
}

export interface ApmAggregateBreakdownItem {
	self_sum: number;
	span_count: number;
	avg: number;
}

export interface ApmAggregateCacheBreakdownItem extends ApmAggregateBreakdownItem {
	by_op?: Record< string, ApmAggregateBreakdownItem >;
}

export interface ApmAggregateBreakdown {
	db: ApmAggregateBreakdownItem;
	wp: ApmAggregateBreakdownItem;
	wp_core: ApmAggregateBreakdownItem;
	plugins: ApmAggregateBreakdownItem;
	cache: ApmAggregateCacheBreakdownItem;
	external: ApmAggregateBreakdownItem;
	template: ApmAggregateBreakdownItem;
	other: ApmAggregateBreakdownItem;
}

export interface ApmAggregateDurationStats {
	sum: number;
	avg: number;
	max: number;
}

export interface ApmAggregateTransactions {
	count: number;
	duration_ms: ApmAggregateDurationStats;
	span_count_sum: number;
}

export interface ApmAggregateSlowestRoute {
	method: string;
	route: string;
	tx_count: number;
	duration_ms: ApmAggregateDurationStats;
}

export interface ApmAggregateSlowestTransaction {
	trace_id: string;
	method: string;
	route: string;
	url: string;
	duration_ms: number;
	outcome: string;
	http_status: number;
	timestamp: string;
}

export interface ApmAggregateSlowestPlugin {
	name: string;
	self_sum_ms: number;
	count: number;
	max_wallclock_ms: number;
}

export interface ApmAggregateSlowestHook {
	action: string;
	total_sum_ms: number;
	count: number;
	max_wallclock_ms: number;
}

export interface ApmAggregateSlowestTemplate {
	name: string;
	total_sum_ms: number;
	count: number;
	max_wallclock_ms: number;
}

export interface ApmAggregateSlowestDbQuery {
	fingerprint: string;
	fingerprint_id: string;
	op: string;
	table?: string;
	self_sum_ms: number;
	count: number;
	max_wallclock_ms: number;
}

export interface ApmAggregateSlowestCache {
	op: string;
	key_prefix: string;
	self_sum_ms: number;
	count: number;
	max_wallclock_ms: number;
}

export interface ApmAggregateSlowestExternal {
	host: string;
	method: string;
	self_sum_ms: number;
	count: number;
	max_wallclock_ms: number;
}

export interface ApmAggregateSlowest {
	routes: ApmAggregateSlowestRoute[];
	transactions?: ApmAggregateSlowestTransaction[];
	plugins: ApmAggregateSlowestPlugin[];
	hooks: ApmAggregateSlowestHook[];
	templates: ApmAggregateSlowestTemplate[];
	db_queries: ApmAggregateSlowestDbQuery[];
	cache: ApmAggregateSlowestCache[];
	externals: ApmAggregateSlowestExternal[];
}

export interface ApmAggregateBucketExtra {
	bucket_minute: string;
	transactions: ApmAggregateTransactions;
	breakdown_ms: ApmAggregateBreakdown;
	slowest: ApmAggregateSlowest;
}

export interface ApmAggregateBucket {
	feature: string;
	atomic_site_id: number;
	blog_id: number;
	'@timestamp'?: string;
	message?: string;
	extra: ApmAggregateBucketExtra;
}

export interface ApmAggregateResponse {
	aggregates: ApmAggregateBucket[];
}

export interface ApmDetailParams {
	method: string;
	route: string;
	start?: number;
	end?: number;
}

export interface ApmDetailMetric {
	sum: number;
	max: number;
}

export interface ApmDetailSpanPrunedChildren {
	count: number;
	self_sum_ms: number;
	total_sum_ms: number;
}

export interface ApmDetailSpan {
	id: string;
	parent_id: string | null;
	name: string;
	category: string;
	method?: string;
	route?: string;
	action?: string;
	plugin?: string;
	callback_source?: string;
	pruned_children?: ApmDetailSpanPrunedChildren;
	count: number;
	tx_count: number;
	self_ms: ApmDetailMetric;
	total_ms: ApmDetailMetric;
}

export interface ApmDetailRequestInfo {
	method: string;
	route: string;
	hostname?: string;
}

export interface ApmDetailPruned {
	node_count: number;
	self_sum_ms: number;
}

export interface ApmDetailExtra {
	bucket_minute: string;
	request: ApmDetailRequestInfo;
	transactions_in_bucket: number;
	spans: ApmDetailSpan[];
	pruned?: ApmDetailPruned;
}

export interface ApmDetailEntry {
	feature: string;
	atomic_site_id: number;
	blog_id: number;
	properties?: {
		bucket_minute: string;
		method: string;
		route: string;
	};
	extra: ApmDetailExtra;
}

export interface ApmDetailResponse {
	details: ApmDetailEntry[];
}
