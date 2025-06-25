import { Operator } from '@wordpress/dataviews';

export type SortableField = string;
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
