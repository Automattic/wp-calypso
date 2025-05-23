/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import type {
	DataViewRenderFieldProps,
	SortDirection,
	Operator,
	ValidationContext,
} from '../types';
import { renderFromElements } from '../utils';
import { OPERATOR_IS, OPERATOR_IS_NOT } from '../constants';

function sort( a: any, b: any, direction: SortDirection ) {
	const boolA = Boolean( a );
	const boolB = Boolean( b );

	if ( boolA === boolB ) {
		return 0;
	}

	// In ascending order, false comes before true
	if ( direction === 'asc' ) {
		return boolA ? 1 : -1;
	}

	// In descending order, true comes before false
	return boolA ? -1 : 1;
}

function isValid( value: any, context?: ValidationContext ) {
	if ( ! [ true, false, undefined ].includes( value ) ) {
		return false;
	}

	return true;
}

const operators: Operator[] = [ OPERATOR_IS, OPERATOR_IS_NOT ];

export default {
	sort,
	isValid,
	Edit: 'checkbox',
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
