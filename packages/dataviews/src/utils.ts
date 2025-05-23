/**
 * Internal dependencies
 */
import {
	ALL_OPERATORS,
	OPERATOR_IS_ANY,
	OPERATOR_IS_NONE,
	SINGLE_SELECTION_OPERATORS,
	OPERATORS,
} from './constants';
import type { DataViewRenderFieldProps, NormalizedField } from './types';

export function sanitizeOperators< Item >( field: NormalizedField< Item > ) {
	let operators = field.filterBy?.operators;

	// Assign default values.
	if ( ! operators || ! Array.isArray( operators ) ) {
		operators = [ OPERATOR_IS_ANY, OPERATOR_IS_NONE ];
	}

	let normalizedOperators = operators.map( ( operator ) =>
		typeof operator === 'string'
			? { name: operator, label: OPERATORS[ operator ].label }
			: operator
	);

	// Make sure only valid operators are used.
	normalizedOperators = normalizedOperators.filter( ( operator ) =>
		ALL_OPERATORS.includes( operator.name )
	);

	// Do not allow mixing single & multiselection operators.
	// Remove multiselection operators if any of the single selection ones is present.
	const hasSingleSelectionOperator = normalizedOperators.some( ( operator ) =>
		SINGLE_SELECTION_OPERATORS.includes( operator.name )
	);
	if ( hasSingleSelectionOperator ) {
		normalizedOperators = normalizedOperators.filter( ( operator ) =>
			SINGLE_SELECTION_OPERATORS.includes( operator.name )
		);
	}

	return normalizedOperators;
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
