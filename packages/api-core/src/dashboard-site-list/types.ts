export interface SiteProfileSite {
	blog_id?: number;
	url?: string;
	blogname?: string;
	stats_visitors?: {
		day: number;
		week: number;
		month: number;
	};
	has_backup?: boolean;
	site_icon?: null | {
		ico: string;
		img: string;
	};
	wpcom_status?: {
		is_staging: boolean;
		is_coming_soon: boolean;
		is_redirect: boolean;
	};
	private?: boolean;
	deleted?: boolean;
}

export interface DashboardSiteListResponse {
	sites: SiteProfileSite[];
	total: number;
}

export interface FetchDashboardSiteListParams {
	fields?: ( keyof SiteProfileSite )[];
	s?: string;
	sort_by?: keyof SiteProfileSite;
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
