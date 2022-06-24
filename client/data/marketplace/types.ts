export type PluginQueryOptions = {
	pageSize?: number;
	page?: number;
	category?: string;
	searchTerm?: string;
	locale: string;
	tag?: string;
	author?: string;
};

export type Plugin = {
	name?: string;
	slug: string;
	version?: string;
	author?: string;
	author_profile?: string;
	tested?: string;
	rating?: number;
	num_ratings?: number;
	support_threads?: number;
	support_threads_resolved?: number;
	active_installs?: number;
	last_updated?: string;
	short_description?: string;
	download_link?: string;
	icons?: Record< string, string >;
};

export type ESIndexResult = {
	slug: string;
	date: string;
	comment_count: number;
	author_login: string;
	blog_id: number;
	like_count: number;
	modified_gmt: string;
	author: string;
	excerpt_html: string;
	'title.default': string;
	'permalink.url.raw': string;
	post_id: number;
	title_html: string;
	blog_icon_url: string;
	modified: string;
	post_type: string;
	'excerpt.default': string;
	date_gmt: string;
	'plugin.stable_tag'?: string;
	'plugin.tested'?: string;
	'plugin.rating'?: number;
	'plugin.num_ratings'?: number;
	'plugin.support_threads'?: number;
	'plugin.support_threads_resolved'?: number;
	'plugin.active_installs'?: number;
};

export type ESHits = Array< { fields: ESIndexResult } >;

export type ESResponse = { data: { results: ESHits; total: number; page_handle: string } };

export type ESTermFilter = { term: Record< string, string > };

export type ESDateRangeFilter = { range: Record< string, { gte: string; lt: string } > };

export type SearchParams = {
	query: string | undefined;
	author: string | undefined;
	groupId: string;
	pageHandle: string | undefined;
	pageSize: number;
	locale: string;
};
