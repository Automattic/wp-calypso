import type { View, Field, Action, SortDirection } from '@wordpress/dataviews';
import type { ReactNode } from 'react';

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
	selection?: string[];
	onSelectionChange?: ( items: string[] ) => void;
	defaultLayouts?: any; // TODO: improve this type
	header?: ReactNode;
}

export interface DataViewsPaginationInfo {
	totalItems: number;
	totalPages: number;
}

export interface DataViewsSort {
	field: string;
	direction: SortDirection;
}

export type DataViewsState = View & {
	selectedItem?: any | undefined;
	layout?: any; // TODO: improve this type.
};
