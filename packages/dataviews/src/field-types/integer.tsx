/**
 * Internal dependencies
 */
import type {
	DataViewRenderFieldProps,
	Operator,
	SortDirection,
} from '../types';
import { renderFromElements } from '../utils';
import {
	OPERATOR_IS,
	OPERATOR_IS_NOT,
	OPERATOR_LESS_THAN,
	OPERATOR_GREATER_THAN,
	OPERATOR_LESS_THAN_OR_EQUAL,
	OPERATOR_GREATER_THAN_OR_EQUAL,
} from '../constants';

function sort( a: any, b: any, direction: SortDirection ) {
	return direction === 'asc' ? a - b : b - a;
}

function isValid( value: any ) {
	// TODO: this implicitly means the value is required.
	if ( value === '' ) {
		return false;
	}

	if ( ! Number.isInteger( Number( value ) ) ) {
		return false;
	}

	return true;
}

const operators: Operator[] = [
	OPERATOR_IS,
	OPERATOR_IS_NOT,
	OPERATOR_LESS_THAN,
	OPERATOR_GREATER_THAN,
	OPERATOR_LESS_THAN_OR_EQUAL,
	OPERATOR_GREATER_THAN_OR_EQUAL,
];

export default {
	sort,
	isValid,
	Edit: 'integer',
	render: ( { item, field }: DataViewRenderFieldProps< any > ) => {
		return field.elements
			? renderFromElements( { item, field } )
			: field.getValue( { item } );
	},
	enableSorting: true,
	filterBy: {
		operators,
	},
};
