/**
 * Internal dependencies
 */
import {
	ALL_OPERATORS,
	OPERATOR_IS_ANY,
	OPERATOR_IS_NONE,
	SINGLE_SELECTION_OPERATORS,
} from './constants';
import type { DataViewRenderFieldProps, NormalizedField } from './types';

export function sanitizeOperators< Item >( field: NormalizedField< Item > ) {
	let operators =
		typeof field.filterBy === 'object' && field.filterBy?.operators;

	// Assign default values.
	if ( ! operators || ! Array.isArray( operators ) ) {
		operators = [ OPERATOR_IS_ANY, OPERATOR_IS_NONE ];
	}

	// Make sure only valid operators are used.
	operators = operators.filter( ( operator ) =>
		ALL_OPERATORS.includes( operator )
	);

	// Do not allow mixing single & multiselection operators.
	// Remove multiselection operators if any of the single selection ones is present.
	const hasSingleSelectionOperator = operators.some( ( operator ) =>
		SINGLE_SELECTION_OPERATORS.includes( operator )
	);
	if ( hasSingleSelectionOperator ) {
		operators = operators.filter( ( operator ) =>
			SINGLE_SELECTION_OPERATORS.includes( operator )
		);
	}

	return operators;
}

export function renderFromElements< Item >( {
	item,
	field,
}: DataViewRenderFieldProps< Item > ) {
	const value = field.getValue( { item } );
	return (
		field?.elements?.find( ( element ) => element.value === value )
			?.label || field.getValue( { item } )
	);
}
