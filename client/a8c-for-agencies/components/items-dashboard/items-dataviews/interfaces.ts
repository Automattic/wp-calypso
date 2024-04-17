import { ReactNode } from 'react';
// todo: Site and SiteDate should not be here
import { Site, SiteData } from 'calypso/a8c-for-agencies/sections/sites/types';

// todo: extract
export interface SitesDataResponse {
	sites: Array< Site >;
	total: number;
	perPage: number;
	totalFavorites: number;
}

export interface SitesDataViewsProps {
	className?: string;
	data: SitesDataResponse | undefined;
	forceTourExampleSite?: boolean;
	isLargeScreen: boolean;
	isLoading: boolean;
	fields: DataViewsColumn[];
	actions: string[];
	onSitesViewChange: ( view: DataViewsState ) => void;
	sitesViewState: DataViewsState;
}

export interface DataViewsColumn {
	id: string;
	enableHiding?: boolean;
	enableSorting?: boolean;
	elements?: {
		value: number;
		label: string;
	}[];
	filterBy?: {
		operators: string[];
		isPrimary?: boolean;
	};
	header: ReactNode;
	getValue: () => null;
	render?: () => ReactNode;
}

export interface DataViewsPaginationInfo {
	totalItems: number;
	totalPages: number;
}

export interface DataViewsSort {
	field: string;
	direction: 'asc' | 'desc' | '';
}

export interface DataViewsFilter {
	field: string;
	operator: string;
	value: number;
}

export interface DataViewsState {
	type: 'table' | 'list' | 'grid';
	search: string;
	filters: DataViewsFilter[];
	perPage: number;
	page: number;
	sort: DataViewsSort;
	hiddenFields: string[];
	layout: object;
	// todo: This is not part of the DataViews. We could extends the DataViewsState interface into a new one adding this.
	selectedSite?: Site | undefined;
}

// todo: extract?
export interface SiteInfo extends SiteData {
	id: number;
}

// todo: Add the DataViewsAction interface: https://github.com/WordPress/gutenberg/blob/trunk/packages/dataviews/README.md#actions-object
