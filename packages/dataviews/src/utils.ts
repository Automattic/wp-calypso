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
		operators = [
			{
				name: OPERATOR_IS_ANY,
				label: OPERATORS[ OPERATOR_IS_ANY ].label,
			},
			{
				name: OPERATOR_IS_NONE,
				label: OPERATORS[ OPERATOR_IS_NONE ].label,
			},
		];
	}

	// Make sure only valid operators are used.
	operators = operators.filter( ( operator ) =>
		ALL_OPERATORS.includes( operator.name )
	);

	// Do not allow mixing single & multiselection operators.
	// Remove multiselection operators if any of the single selection ones is present.
	const hasSingleSelectionOperator = operators.some( ( operator ) =>
		SINGLE_SELECTION_OPERATORS.includes( operator.name )
	);
	if ( hasSingleSelectionOperator ) {
		operators = operators.filter( ( operator ) =>
			SINGLE_SELECTION_OPERATORS.includes( operator.name )
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
