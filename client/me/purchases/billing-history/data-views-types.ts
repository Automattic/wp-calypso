import { Operator } from '@wordpress/dataviews';

export type SortableField = 'date' | 'service' | 'type' | 'amount';
export type ViewType = 'table';
export type SortDirection = 'asc' | 'desc';

export interface Sort {
	field: SortableField;
	direction: SortDirection;
}

export interface Filter {
	field: string;
	operator: Operator;
	value: string | string[];
}

export interface ViewStateUpdate {
	page?: number;
	perPage?: number;
	sort?: Sort;
	filters?: Filter[];
	search?: string;
	fields?: string[];
}

export interface ViewState {
	type: ViewType;
	search: string;
	filters: Filter[];
	page: number;
	perPage: number;
	sort: Sort;
	fields: string[];
	hiddenFields: string[];
	layout?: {
		styles?: Record< string, { width: string } >;
	};
}
