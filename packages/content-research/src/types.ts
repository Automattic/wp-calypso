export interface EngagementData {
	upvotes?: number;
	comments?: number;
}

export type Source = 'hn' | 'polymarket' | 'reader' | 'googlenews' | 'myposts';

export interface ResearchResult {
	source: Source;
	title: string;
	url: string;
	excerpt?: string;
	engagement?: EngagementData;
	author?: string;
	timestamp?: string;
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
