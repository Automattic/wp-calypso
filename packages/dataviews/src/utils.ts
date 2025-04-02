/**
 * Internal dependencies
 */
import {
	ALL_OPERATORS,
	OPERATOR_IS,
	OPERATOR_IS_NOT,
	OPERATOR_IS_ANY,
	OPERATOR_IS_NONE,
} from './constants';
import type { NormalizedField } from './types';

export function sanitizeOperators< Item >( field: NormalizedField< Item > ) {
	let operators = field.filterBy?.operators;

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
	if (
		operators.includes( OPERATOR_IS ) ||
		operators.includes( OPERATOR_IS_NOT )
	) {
		operators = operators.filter( ( operator ) =>
			[ OPERATOR_IS, OPERATOR_IS_NOT ].includes( operator )
		);
	}

	return operators;
}
