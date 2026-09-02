export interface AgencySiteStat {
	total: number;
	trend: 'up' | 'down' | 'same';
	trend_change: number;
}

export interface AgencySiteStats {
	views: AgencySiteStat;
	visitors: AgencySiteStat;
	likes?: AgencySiteStat;
}

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
	last_backup_time?: string | null;
	plan_name?: string | null;
	plan_slug?: string | null;
	active_paid_subscription_slugs?: string[];
	is_atomic?: boolean;
	is_simple?: boolean;
	last_publish?: string;
	total_wpcom_subscribers?: number;
	storage_used_bytes?: number;
	max_storage_bytes?: number;
	wpcom_status?: {
		is_staging: boolean | null;
		is_coming_soon: boolean | null;
		is_redirect: boolean | null;
		is_launched: boolean | null;
		is_private?: boolean | null;
	};
	php_version?: string;
	wordpress_version?: string;
	hosting_provider_guess?: string;
	site_stats?: AgencySiteStats;
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
