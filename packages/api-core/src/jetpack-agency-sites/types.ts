export interface AgencySite {
	blog_id: number;
	url: string;
	blogname?: string;
	url_with_scheme?: string;
	has_backup?: boolean;
	jetpack_boost_scores?: {
		overall: number;
	};
	site_color?: string;
	icon?: {
		img: string;
		ico: string;
	};
}

export interface FetchAgencySitesOptions {
	search?: string;
	sort_field?: 'url';
	sort_direction?: 'asc' | 'desc';
	page?: number;
	per_page?: number;
}

export interface FetchAgencySitesResponse {
	sites: AgencySite[];
	total: number;
	per_page?: number;
}
