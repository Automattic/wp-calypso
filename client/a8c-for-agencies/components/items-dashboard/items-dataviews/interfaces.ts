import { ReactNode } from 'react';

export interface ItemsDataViewsType< T > {
	items: T[] | undefined;
	pagination: DataViewsPaginationInfo;
	enableSearch?: boolean;
	searchLabel?: string;
	fields: DataViewsColumn[];
	actions?: DataViewsAction[];
	getItemId?: ( item: T ) => string;
	itemFieldId?: string; // The field path to get the item id. Examples `id` or `site.blog_id`
	setDataViewsState: ( callback: ( prevState: DataViewsState ) => DataViewsState ) => void;
	dataViewsState: DataViewsState;
	onSelectionChange?: ( item: T[] ) => void;
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
	getValue?: ( item: any ) => string | boolean | number | undefined;
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
	hiddenFields?: string[];
	layout: object;
	selectedItem?: any | undefined;
}
