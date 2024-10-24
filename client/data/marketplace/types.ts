export type PluginQueryOptions = {
	pageSize?: number;
	page?: number;
	category?: string;
	searchTerm?: string;
	locale: string;
	tag?: string;
	author?: string;
	slugs?: string[];
};

export type Plugin = {
	name?: string;
	slug: string;
	software_slug?: string;
	org_slug?: string;
	version?: string;
	author?: string;
	author_name?: string;
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
	icon?: string;
	railcar: Railcar;
	variations?: {
		monthly: { product_slug?: string; product_id?: number };
		yearly: { product_slug?: string; product_id?: number };
	};
	premium_slug?: string;
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
	'permalink.url.raw': string;
	post_id: number;
	title_html: string;
	blog_icon_url: string;
	modified: string;
	post_type: string;
	date_gmt: string;
	'plugin.stable_tag'?: string;
	'plugin.tested'?: string;
	'plugin.support_threads'?: number;
	'plugin.support_threads_resolved'?: number;
	plugin: {
		store_product_monthly_id?: number;
		store_product_yearly_id?: number;
		software_slug?: string;
		org_slug?: string;
		author: string;
		title: string;
		excerpt: string;
		icons: string;
		rating: number;
		num_ratings: number;
		active_installs: number;
		premium_slug: string;
	};
};

export type Railcar = Record< string, string | number >;

export type ESHits = Array< { fields: ESIndexResult; railcar: Railcar } >;

export type ESResponse = { data: { results: ESHits; total: number; page_handle: string } };

export type ESTermFilter = { term: Record< string, string > };

export type ESDateRangeFilter = { range: Record< string, { gte: string; lt: string } > };

export type SearchParams = {
	query: string | undefined;
	author: string | undefined;
	category: string | undefined;
	groupId: string;
	pageHandle: string | undefined;
	pageSize: number;
	locale: string;
	slugs?: string[] | undefined;
};

export type ReinstallPluginsResponse = {
	message: string;
};

export type ESRelatedPluginsResult = {
	fields: ESRelatedPlugin;
};

export type ESRelatedPlugin = {
	categories: Array< string >;
	short_description?: string;
	icons?: string;
	software_slug?: string;
	product_slug?: string;
	slug?: string;
	name?: string;
	rating?: number;
	variations: PluginPeriodVariations;
};

export type RelatedPlugin = {
	categories: Array< string >;
	short_description?: string;
	icon?: string;
	software_slug?: string;
	productSlug?: string;
	slug?: string;
	name?: string;
	rating?: number;
	variations?: PluginPeriodVariations;
};

export type AddPluginUpgrade = {
	success: true;
};

export type PluginPeriodVariations = {
	monthly: { product_slug?: string; product_id?: number };
	yearly: { product_slug?: string; product_id?: number };
};
