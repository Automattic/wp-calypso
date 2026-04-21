export interface EngagementData {
	upvotes?: number;
	comments?: number;
}

export interface ResearchResult {
	source: 'reddit' | 'hn' | 'polymarket' | 'reader' | 'googlenews';
	title: string;
	url: string;
	excerpt?: string;
	engagement?: EngagementData;
	author?: string;
	timestamp?: string;
	subreddit?: string;
	odds?: string;
	volume?: string;
}

export interface ResearchMeta {
	topic: string;
	sources_queried: string[];
	total_results: number;
}

export interface ResearchResponse {
	results: ResearchResult[];
	meta: ResearchMeta;
}

export interface ResearchSummary {
	summary: string;
	key_findings: string[];
	suggested_angles: string[];
}

export type SourceFilter = 'all' | 'reddit' | 'hn' | 'polymarket' | 'reader' | 'googlenews';
