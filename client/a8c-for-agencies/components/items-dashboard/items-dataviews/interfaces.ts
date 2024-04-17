import { ReactNode } from 'react';

export interface ItemsDataViewsType {
	items: any[] | undefined;
	pagination: DataViewsPaginationInfo;
	searchLabel?: string;
	fields: DataViewsColumn[];
	actions?: DataViewsAction[];
	getItemId?: ( item: any ) => string;
	itemFieldId?: string; // The path to get the item id: `id` or `site.blog_id`
	onDataViewsStateChange: ( view: DataViewsState ) => void;
	dataViewsState: DataViewsState;
	selectedItem?: any | undefined;
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
	type?: string;
	header: ReactNode;
	getValue: ( item: any ) => string | boolean | number | undefined;
	render?: ( item: any ) => ReactNode | null;
}

export interface DataViewsAction {
	id: string;
	label: string;
	isPrimary?: boolean;
	icon?: string;
	isEligible?: ( record: any ) => boolean;
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
}
