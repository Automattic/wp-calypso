/**
 * WordPress dependencies
 */
import { isEmail } from '@wordpress/url';

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

function isValid( value: any ) {
	// TODO: this implicitly means the value is required.
	if ( value === '' ) {
		return false;
	}

	if ( ! isEmail( value ) ) {
		return false;
	}

	return true;
}

const operators: Operator[] = [ OPERATOR_IS_ANY, OPERATOR_IS_NONE ];

export default {
	sort,
	isValid,
	Edit: 'email',
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
