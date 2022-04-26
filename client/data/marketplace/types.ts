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
	name: string;
	slug: string;
	version: string;
	author: string;
	author_profile: string;
	tested: string;
	rating: number;
	num_ratings: number;
	support_threads: number;
	support_threads_resolved: number;
	active_installs: number;
	last_updated: string;
	short_description: string;
	download_link?: string;
	icons: Record< string, string >;
};

export type ESIndexResult = {
	rating: number;
	post_id: number;
	'meta.assets_icons.value': string;
	'meta.header_author.value': string;
	'meta.header_author_uri.value': string;
	'meta.last_updated.value': string;
	'taxonomy.plugin_category.name': string;
	'taxonomy.plugin_tags.name': string;
	excerpt_en: string;
	title_en: string;
	stable_tag: string;
	author: string;
	tested: string;
	num_ratings: number;
	support_threads: number;
	support_threads_resolved: number;
	active_installs: number;
	slug: string;
};

export type ESHits = Array< { fields: ESIndexResult } >;

export type ESResponse = { hits: ESHits; total: number };
