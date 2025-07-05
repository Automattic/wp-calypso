/**
 * Internal dependencies
 */
import type {
	SortDirection,
	ValidationContext,
	FieldTypeDefinition,
} from '../types';

function sort( a: any, b: any, direction: SortDirection ) {
	return 0;
}

function isValid( value: any, context?: ValidationContext ) {
	if ( context?.elements ) {
		const validValues = context?.elements.map( ( f ) => f.value );
		if ( ! validValues.includes( value ) ) {
			return false;
		}
	}

	return true;
}

export default {
	sort,
	isValid,
	Edit: null,
	render: () => null,
	enableSorting: false,
	filterBy: false,
} satisfies FieldTypeDefinition< any >;
