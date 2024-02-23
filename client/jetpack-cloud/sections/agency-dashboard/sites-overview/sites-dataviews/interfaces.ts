import { Site } from '../types';

export interface SitesDataViewsProps {
	data:
		| { sites: Array< Site >; total: number; perPage: number; totalFavorites: number }
		| undefined;
	isLoading: boolean;
	onSitesViewChange: ( view: SitesViewState ) => void;
	sitesViewState: SitesViewState;
}

export interface Sort {
	field: string;
	direction: 'asc' | 'desc';
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
	sort: Sort;
	search: string;
	filters: Filter[];
	hiddenFields: string[];
	layout: object;
	selectedSite?: Site | undefined;
}
