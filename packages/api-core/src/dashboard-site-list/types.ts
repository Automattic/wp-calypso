export interface DashboardSiteListSite {
	badge?: null | 'staging' | 'trial' | 'p2';
	blog_id: number; // Site ID is always fetched
	deleted?: boolean;
	has_backup?: boolean;
	name?: string;
	plan?: {
		product_id: number;
		product_name_short: string;
	};
	private?: boolean;
	icon?: null | {
		ico: string;
		img: string;
	};
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
