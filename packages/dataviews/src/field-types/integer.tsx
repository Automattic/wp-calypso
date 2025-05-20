/**
 * Internal dependencies
 */
import type {
	DataViewRenderFieldProps,
	Operator,
	SortDirection,
	ValidationContext,
} from '../types';
import { renderFromElements } from '../utils';
import { OPERATOR_IS, OPERATOR_IS_NOT } from '../constants';

function sort( a: any, b: any, direction: SortDirection ) {
	return direction === 'asc' ? a - b : b - a;
}

function isValid( value: any, context?: ValidationContext ) {
	// TODO: this implicitly means the value is required.
	if ( value === '' ) {
		return false;
	}

	if ( ! Number.isInteger( Number( value ) ) ) {
		return false;
	}

	if ( context?.elements ) {
		const validValues = context?.elements.map( ( f ) => f.value );
		if ( ! validValues.includes( Number( value ) ) ) {
			return false;
		}
	}

	return true;
}

const operators: Operator[] = [ OPERATOR_IS, OPERATOR_IS_NOT ];

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
