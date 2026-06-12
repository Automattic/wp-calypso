export interface ReadStreamPost {
	ID: number;
	site_ID?: number;
	feed_ID?: number;
	feed_item_ID?: number;
	global_ID?: string;
	date?: string;
	URL?: string;
	site_icon?: { ico?: string };
	site_name?: string;
	description?: string;
	feed_URL?: string;
	railcar?: unknown;
	is_external?: boolean;
	[ key: string ]: unknown;
}

export interface ReadStreamDateRange {
	after?: string | null;
	before?: string | null;
}

export interface ReadStreamRecommendedSite {
	feed_ID?: number;
	URL?: string;
	icon?: { ico?: string };
	description?: string;
	name?: string;
	feed_URL?: string;
	[ key: string ]: unknown;
}

export type ReadStreamCard =
	| { type: 'post'; data: ReadStreamPost }
	| { type: 'recommended_blogs'; data: ReadStreamRecommendedSite[] }
	| { type: 'new_sites'; data: ReadStreamRecommendedSite[] };

export interface ReadStreamResponse {
	posts?: ReadStreamPost[];
	cards?: ReadStreamCard[];
	date_range?: ReadStreamDateRange;
	next_page?: string;
	next_page_handle?: string;
	meta?: { next_page?: string };
	found?: number;
	algorithm?: string;
	total_cards?: number;
	total_pages?: number;
	user_interests?: string[];
	[ key: string ]: unknown;
}

export type ReadStreamQueryParams = Record< string, string | number | boolean | null | undefined >;
