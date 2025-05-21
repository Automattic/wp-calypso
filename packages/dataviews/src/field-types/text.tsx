/**
 * Internal dependencies
 */
import type {
	DataViewRenderFieldProps,
	SortDirection,
	Operator,
} from '../types';
import { renderFromElements } from '../utils';
import { OPERATOR_IS_ANY, OPERATOR_IS_NONE } from '../constants';

function sort( valueA: any, valueB: any, direction: SortDirection ) {
	return direction === 'asc'
		? valueA.localeCompare( valueB )
		: valueB.localeCompare( valueA );
}

const operators: Operator[] = [ OPERATOR_IS_ANY, OPERATOR_IS_NONE ];

export default {
	sort,
	Edit: 'text',
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
