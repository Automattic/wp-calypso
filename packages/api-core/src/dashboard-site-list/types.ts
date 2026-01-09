export type SiteStatus =
	| 'deleted'
	| 'migration_pending'
	| 'migration_started'
	| 'difm_lite_in_progress'
	| null;

export type SiteBadge = 'staging' | 'trial' | 'p2' | SiteStatus;

export interface DashboardSiteListSite {
	badge?: SiteBadge;
	blog_id: number; // Site ID is always fetched
	capabilities?: {
		manage_options: boolean;
	};
	deleted?: boolean;
	enabled_modules?: null | string[];
	has_backup?: boolean;
	hosting_provider_guess?: string;
	name?: string;
	plan?: {
		product_id: number;
		product_slug: string;
		product_name_short: string;
		product_name_en: string;
		expired: boolean;
		is_free: boolean;
		features: {
			active: string[];
		};
	};
	private?: boolean;
	icon?: null | {
		ico: string;
		img: string;
	};
	is_a8c?: boolean;
	is_atomic?: boolean;
	is_garden?: boolean;
	is_jetpack?: boolean;
	is_p2?: boolean;
	is_vip?: boolean;
	last_publish?: string;
	owner_id?: number;
	php_version?: string;
	slug: string; // Slug is always fetched
	status?: SiteStatus;
	views?: null | number;
	visitors?: null | number;
	total_wpcom_subscribers?: number;
	url?: { value: string; with_scheme: string };
	wordpress_version?: string;
	wpcom_status?: {
		is_staging: boolean;
		is_coming_soon: boolean;
		is_redirect: boolean;
		is_launched?: boolean;
	};
}

export interface DashboardSiteListResponse {
	sites: DashboardSiteListSite[];
	total: number;
}

export interface FetchDashboardSiteListParams {
	fields?: ( keyof DashboardSiteListSite )[];
	s?: string;
	filters?: {
		plan?: string[];
		is_a8c?: boolean;
	};
	sort_by?: keyof DashboardSiteListSite;
	sort_direction?: 'asc' | 'desc';
	page?: number;
	per_page?: number;
}

export interface FetchDashboardSiteFiltersParams {
	fields: ( keyof DashboardFilters )[];
}

export interface DashboardFilters {
	plan?: Array< { name: string; value: string; name_en: string } >;
}
