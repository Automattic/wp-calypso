/**
 * Internal dependencies
 */
import type { SortDirection, ValidationContext } from '../types';

function sort( a: any, b: any, direction: SortDirection ) {
	return direction === 'asc' ? a - b : b - a;
}

function isValid( value: any, context?: ValidationContext ) {
	// TODO: this implicitly means the value is required.
	if ( value === '' ) {
		return false;
	}

	if ( ! Number.isInteger( Number( value ) ) ) {
		return false;
	}

	if ( context?.elements ) {
		const validValues = context?.elements.map( ( f ) => f.value );
		if ( ! validValues.includes( Number( value ) ) ) {
			return false;
		}
	}

	return true;
}

export default {
	sort,
	isValid,
	Edit: 'integer',
};
