/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import { arrowDown, arrowUp } from '@wordpress/icons';

/**
 * Internal dependencies
 */
import type { Operator } from './types';

// Filter operators.
export const OPERATOR_IS = 'is';
export const OPERATOR_IS_NOT = 'isNot';
export const OPERATOR_IS_ANY = 'isAny';
export const OPERATOR_IS_NONE = 'isNone';
export const OPERATOR_IS_ALL = 'isAll';
export const OPERATOR_IS_NOT_ALL = 'isNotAll';
export const OPERATOR_LESS_THAN = 'lessThan';
export const OPERATOR_GREATER_THAN = 'greaterThan';
export const OPERATOR_LESS_THAN_OR_EQUAL = 'lessThanOrEqual';
export const OPERATOR_GREATER_THAN_OR_EQUAL = 'greaterThanOrEqual';
export const OPERATOR_CONTAINS = 'contains';
export const OPERATOR_NOT_CONTAINS = 'notContains';
export const OPERATOR_STARTS_WITH = 'startsWith';

export const ALL_OPERATORS = [
	OPERATOR_IS,
	OPERATOR_IS_NOT,
	OPERATOR_IS_ANY,
	OPERATOR_IS_NONE,
	OPERATOR_IS_ALL,
	OPERATOR_IS_NOT_ALL,
	OPERATOR_LESS_THAN,
	OPERATOR_GREATER_THAN,
	OPERATOR_LESS_THAN_OR_EQUAL,
	OPERATOR_GREATER_THAN_OR_EQUAL,
	OPERATOR_CONTAINS,
	OPERATOR_NOT_CONTAINS,
	OPERATOR_STARTS_WITH,
];

export const SINGLE_SELECTION_OPERATORS = [
	OPERATOR_IS,
	OPERATOR_IS_NOT,
	OPERATOR_LESS_THAN,
	OPERATOR_GREATER_THAN,
	OPERATOR_LESS_THAN_OR_EQUAL,
	OPERATOR_GREATER_THAN_OR_EQUAL,
	OPERATOR_CONTAINS,
	OPERATOR_NOT_CONTAINS,
	OPERATOR_STARTS_WITH,
];

export const OPERATORS: Record< Operator, { key: string; label: string } > = {
	[ OPERATOR_IS ]: {
		key: 'is-filter',
		label: __( 'Is' ),
	},
	[ OPERATOR_IS_NOT ]: {
		key: 'is-not-filter',
		label: __( 'Is not' ),
	},
	[ OPERATOR_IS_ANY ]: {
		key: 'is-any-filter',
		label: __( 'Is any' ),
	},
	[ OPERATOR_IS_NONE ]: {
		key: 'is-none-filter',
		label: __( 'Is none' ),
	},
	[ OPERATOR_IS_ALL ]: {
		key: 'is-all-filter',
		label: __( 'Is all' ),
	},
	[ OPERATOR_IS_NOT_ALL ]: {
		key: 'is-not-all-filter',
		label: __( 'Is not all' ),
	},
	[ OPERATOR_LESS_THAN ]: {
		key: 'less-than-filter',
		label: __( 'Less than' ),
	},
	[ OPERATOR_GREATER_THAN ]: {
		key: 'greater-than-filter',
		label: __( 'Greater than' ),
	},
	[ OPERATOR_LESS_THAN_OR_EQUAL ]: {
		key: 'less-than-or-equal-filter',
		label: __( 'Less than or equal' ),
	},
	[ OPERATOR_GREATER_THAN_OR_EQUAL ]: {
		key: 'greater-than-or-equal-filter',
		label: __( 'Greater than or equal' ),
	},
	[ OPERATOR_CONTAINS ]: {
		key: 'contains-filter',
		label: __( 'Contains' ),
	},
	[ OPERATOR_NOT_CONTAINS ]: {
		key: 'not-contains-filter',
		label: __( "Doesn't contain" ),
	},
	[ OPERATOR_STARTS_WITH ]: {
		key: 'starts-with-filter',
		label: __( 'Starts with' ),
	},
};

export const SORTING_DIRECTIONS = [ 'asc', 'desc' ] as const;
export const sortArrows = { asc: '↑', desc: '↓' };
export const sortValues = { asc: 'ascending', desc: 'descending' } as const;
export const sortLabels = {
	asc: __( 'Sort ascending' ),
	desc: __( 'Sort descending' ),
};
export const sortIcons = {
	asc: arrowUp,
	desc: arrowDown,
};

// View layouts.
export const LAYOUT_TABLE = 'table';
export const LAYOUT_GRID = 'grid';
export const LAYOUT_LIST = 'list';
