export interface DataViewsStateSort {
	field: string;
	direction: 'asc' | 'desc';
}

export interface DataViewsStateLayout {
	mediaField?: string;
	primaryField?: string;
}

export interface DataViewsState {
	type: string;
	search: string;
	perPage: number;
	sort: DataViewsStateSort;
	page: number;
	hiddenFields: string[];
	layout: DataViewsStateLayout;
	selectedSiteId?: number;
}

export interface DataViewsField {
	id: string;
	header: string;
	enableHiding: boolean;
	enableSorting: boolean;
}

export interface DataViewsPaginationInfo {
	totalItems: number;
	totalPages: number;
}
