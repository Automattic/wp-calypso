export interface DashboardSiteListSite {
	badge?: null | 'staging' | 'trial' | 'p2';
	blog_id: number; // Site ID is always fetched
	capabilities?: {
		manage_options: boolean;
	};
	deleted?: boolean;
	has_backup?: boolean;
	name?: string;
	plan?: {
		product_id: number;
		product_slug: string;
		product_name_short: string;
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
	is_vip?: boolean;
	owner_id?: number;
	slug: string; // Slug is always fetched
	visitors?: null | number;
	total_wpcom_subscribers?: number;
	url?: { value: string; with_scheme: string };
	wpcom_status?: {
		is_staging: boolean;
		is_coming_soon: boolean;
		is_redirect: boolean;
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
	plan?: Array< { name: string; value: string } >;
}
