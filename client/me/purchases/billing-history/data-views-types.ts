import { Operator } from '@wordpress/dataviews';

export type SortableField = 'date' | 'service' | 'type' | 'amount';
export type ViewType = 'table';
export type SortDirection = 'asc' | 'desc';

export interface Filter {
	field: string;
	operator: Operator;
	value: string | string[];
}

export interface ViewStateUpdate {
	page?: number;
	perPage?: number;
	sort?: {
		field: string;
		direction: SortDirection;
	};
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
	sort: {
		field: SortableField;
		direction: SortDirection;
	};
	fields: string[];
	hiddenFields: string[];
	layout?: {
		styles?: Record< string, { width: string } >;
	};
}
