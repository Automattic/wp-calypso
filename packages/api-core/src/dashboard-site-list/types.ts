export interface FetchDashboardSiteFiltersParams {
	fields: ( keyof DashboardFilters )[];
}

export interface DashboardFilters {
	plan?: Array< { name: string; value: string; name_en: string } >;
}

export interface DisconnectedAtomicSite {
	ID: number;
	slug: string;
}

export interface DashboardSiteIssues {
	disconnected_atomic_sites: DisconnectedAtomicSite[];
}
