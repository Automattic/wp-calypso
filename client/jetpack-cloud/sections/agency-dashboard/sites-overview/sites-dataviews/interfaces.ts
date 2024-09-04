import { type DashboardSortInterface, Site, SiteData } from '../types';

export interface SitesDataResponse {
	sites: Array< Site >;
	total: number;
	perPage: number;
	totalDevelopmentSites: number;
	totalFavorites: number;
}

export interface SitesDataViewsProps {
	className?: string;
	data: SitesDataResponse | undefined;
	forceTourExampleSite?: boolean;
	isLargeScreen: boolean;
	isLoading: boolean;
	onSitesViewChange: ( view: SitesViewState ) => void;
	sitesViewState: SitesViewState;
}

export interface Filter {
	field: string;
	operator: string;
	value: number;
}

export interface SitesViewState {
	type: 'table' | 'list' | 'grid';
	perPage: number;
	page: number;
	sort: DashboardSortInterface;
	search: string;
	filters: Filter[];
	hiddenFields: string[];
	layout: object;
	selectedSite?: Site | undefined;
}

export interface SiteInfo extends SiteData {
	id: number;
}
