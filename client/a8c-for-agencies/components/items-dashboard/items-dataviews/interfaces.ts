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

export interface ItemsDataViews {
	items: any[] | undefined;
	pagination: DataViewsPaginationInfo;
	searchLabel?: string;
	fields: DataViewsColumn[];
	actions?: DataViewsAction[];
	getItemId?: ( item: any ) => string;
	itemFieldId?: string; // The path to get the item id: `id` or `site.blog_id`
	onSitesViewChange: ( view: DataViewsState ) => void;
	sitesViewState: DataViewsState;
	// todo: forceTourExampleSite should not be here. Extract
	//forceTourExampleSite?: boolean;
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

export interface DataViewsAction {
	id: string;
	label: string;
	isPrimary?: boolean;
	icon?: string;
	isEligible?: ( record: Site ) => boolean;
	isDestructive?: boolean;
	callback?: () => void;
	RenderModal?: ReactNode;
	hideModalHeader?: boolean;
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
