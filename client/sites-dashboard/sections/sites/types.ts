import { DashboardSortInterface } from 'calypso/sites-dashboard/sections/sites/sites-overview/types';
import type { SiteExcerptData } from '@automattic/sites';

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
	selectedSite?: SiteExcerptData | undefined;
}

export interface SitesDashboardContextInterface {
	selectedCategory?: string;
	setSelectedCategory: ( category: string ) => void;

	hideListing?: boolean;
	setHideListing: ( hideListing: boolean ) => void;

	sitesViewState: SitesViewState;
	setSitesViewState: React.Dispatch< React.SetStateAction< SitesViewState > >;

	initialSelectedSiteUrl?: string;
	path: string;
	currentPage: number;
	sort: DashboardSortInterface;
}
