/**
 * Internal dependencies
 */
import type {
	DataViewRenderFieldProps,
	SortDirection,
	ValidationContext,
	FieldTypeDefinition,
} from '../types';
import {
	OPERATOR_IS_ALL,
	OPERATOR_IS_ANY,
	OPERATOR_IS_NONE,
	OPERATOR_IS_NOT_ALL,
} from '../constants';

// Sort arrays by length, then alphabetically by joined string
function sort( valueA: any, valueB: any, direction: SortDirection ) {
	const arrA = Array.isArray( valueA ) ? valueA : [];
	const arrB = Array.isArray( valueB ) ? valueB : [];
	if ( arrA.length !== arrB.length ) {
		return direction === 'asc'
			? arrA.length - arrB.length
			: arrB.length - arrA.length;
	}

	const joinedA = arrA.join( ',' );
	const joinedB = arrB.join( ',' );
	return direction === 'asc'
		? joinedA.localeCompare( joinedB )
		: joinedB.localeCompare( joinedA );
}

function isValid( value: any, context?: ValidationContext ) {
	if ( ! Array.isArray( value ) ) {
		return false;
	}

	// Only allow strings for now. Can be extended to other types in the future.
	if ( ! value.every( ( v ) => typeof v === 'string' ) ) {
		return false;
	}

	if ( context?.elements ) {
		const validValues = context.elements.map( ( f ) => f.value );
		if ( ! value.every( ( v ) => validValues.includes( v ) ) ) {
			return false;
		}
	}
	return true;
}

function render( { item, field }: DataViewRenderFieldProps< any > ) {
	const value = field.getValue( { item } ) || [];
	return value.join( ', ' );
}

const arrayFieldType: FieldTypeDefinition< any > = {
	sort,
	isValid,
	Edit: null, // Not implemented yet
	render,
	enableSorting: true,
	filterBy: {
		defaultOperators: [ OPERATOR_IS_ANY, OPERATOR_IS_NONE ],
		validOperators: [
			OPERATOR_IS_ANY,
			OPERATOR_IS_NONE,
			OPERATOR_IS_ALL,
			OPERATOR_IS_NOT_ALL,
		],
	},
};

export default arrayFieldType;
