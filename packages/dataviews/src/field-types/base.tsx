/**
 * Internal dependencies
 */
import type {
	DataViewRenderFieldProps,
	SortDirection,
	ValidationContext,
	Operator,
} from '../types';
import { renderFromElements } from '../utils';

function sort( a: any, b: any, direction: SortDirection ) {
	if ( typeof a === 'number' && typeof b === 'number' ) {
		return direction === 'asc' ? a - b : b - a;
	}

	return direction === 'asc' ? a.localeCompare( b ) : b.localeCompare( a );
}

function isValid( value: any, context?: ValidationContext ) {
	if ( context?.elements ) {
		const validValues = context?.elements?.map( ( f ) => f.value );
		if ( ! validValues.includes( value ) ) {
			return false;
		}
	}

	return true;
}

const operators: Operator[] = [];

export default {
	sort,
	isValid,
	Edit: null,
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
