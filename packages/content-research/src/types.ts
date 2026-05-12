export interface EngagementData {
	upvotes?: number;
	comments?: number;
}

export type Source = 'hn' | 'reader' | 'googlenews' | 'myposts';

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

export interface SuggestedAngle {
	type: string;
	angle: string;
	blog_value?: string;
}

export interface EditorialRelevance {
	score: number;
	reason?: string;
}

export interface BloggerBrief {
	best_angle?: string;
	core_thesis?: string;
	reader_takeaway?: string;
	what_to_add?: string[];
	avoid?: string[];
}

export interface ResearchSummary {
	title?: string;
	tldr?: string;
	why_it_matters?: string;
	summary: string;
	key_findings: string[];
	suggested_angles: Array< string | SuggestedAngle >;
	blogger_brief?: BloggerBrief;
	headline_ideas?: string[];
	opening_hooks?: string[];
	audience?: string[];
	seo_keywords?: string[];
	tags?: string[];
	editorial_relevance?: EditorialRelevance;
	fact_check_notes?: string[];
}
