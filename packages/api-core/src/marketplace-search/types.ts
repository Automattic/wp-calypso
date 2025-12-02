export type Category = {
	menu: string;
	title: string;
	slug: string;
	tags: string[];
	preview: Plugin[];
	description?: string;
	icon?: string;
	separator?: boolean;
	showOnlyActive?: boolean;
};

export type Plugin = {
	slug: string;
	name: string;
	short_description: string;
	icon: string;
};

export type SearchParams = {
	query?: string;
	author?: string;
	category: string | undefined;
	groupId: string;
	pageHandle?: string;
	pageSize: number;
	locale?: string;
	slugs?: string[] | undefined;
};

export interface MarketplaceSearchResult {
	_score: number | null;
	fields: {
		comment_count: number;
		date: string;
		author_login: string;
		blog_id: number;
		like_count: number;
		modified_gmt: string;
		author: string;
		permalink: {
			url: {
				raw: string;
			};
		};
		post_id: number;
		blog_icon_url: string;
		modified: string;
		post_type: string;
		date_gmt: string;
		slug: string;
		plugin: {
			rating: number;
			num_ratings: number;
			title: string;
			author: string;
			icons: string;
			excerpt: string;
			active_installs: number;
			premium_slug?: string;
		};
	};
	result_type: string;
	railcar: {
		railcar: string;
		fetch_algo: string;
		fetch_position: number;
		rec_blog_id: number;
		rec_post_id: number;
		fetch_lang: string;
		fetch_query: string;
		session_id: string;
	};
}

export interface MarketplaceSearch {
	data: {
		total: number;
		corrected_query: boolean;
		page_handle: string;
		results: MarketplaceSearchResult[];
		suggestions: [];
		aggregations: [];
	};
	headers: [];
	status: number;
}
