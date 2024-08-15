import type { View, Field, Action, SortDirection } from '@wordpress/dataviews';

export interface ItemsDataViewsType< T > {
	items: T[] | undefined;
	pagination: DataViewsPaginationInfo;
	enableSearch?: boolean;
	searchLabel?: string;
	fields: Field< T >[];
	actions?: Action< T >[];
	getItemId?: ( item: T ) => string;
	itemFieldId?: string; // The field path to get the item id. Examples `id` or `site.blog_id`
	setDataViewsState: ( callback: ( prevState: DataViewsState ) => DataViewsState ) => void;
	dataViewsState: DataViewsState;
	onSelectionChange?: ( item: T[] ) => void;
}

export interface DataViewsPaginationInfo {
	totalItems: number;
	totalPages: number;
}

export interface DataViewsSort {
	field: string;
	direction: SortDirection;
}

export interface DataViewsFilter {
	field: string;
	operator: string;
	value: number;
}

export type DataViewsState = View & {
	selectedItem?: any | undefined;
};
