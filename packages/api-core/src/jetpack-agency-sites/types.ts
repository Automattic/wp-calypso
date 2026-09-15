export interface AgencySite {
	blog_id: number;
	a4a_site_id?: number;
	a4a_is_dev_site?: boolean;
	url: string;
	blogname?: string;
	url_with_scheme?: string;
	has_backup?: boolean;
	has_scan?: boolean;
	jetpack_boost_scores?: {
		overall: number;
	};
	site_color?: string;
	icon?: {
		img: string;
		ico: string;
	};
	php_version?: string;
	wordpress_version?: string;
	hosting_provider_guess?: string;
	is_atomic?: boolean;
	is_simple?: boolean;
}

export interface FetchAgencySitesOptions {
	search?: string;
	sort_field?: 'url';
	sort_direction?: 'asc' | 'desc';
	page?: number;
	per_page?: number;
	not_multisite?: boolean;
}

export interface FetchAgencySitesResponse {
	sites: AgencySite[];
	total: number;
	per_page?: number;
}
