export interface FetchDashboardSiteFiltersParams {
	fields: ( keyof DashboardFilters )[];
}

export interface DashboardFilters {
	plan?: Array< { name: string; value: string; name_en: string } >;
}
