/**
 * Internal dependencies
 */
import type { NormalizedFilter, Filter } from '../../types';

const EMPTY_ARRAY: [] = [];

export const getCurrentValue = (
	filterDefinition: NormalizedFilter,
	currentFilter?: Filter
) => {
	if ( filterDefinition.singleSelection ) {
		return currentFilter?.value;
	}

	if ( Array.isArray( currentFilter?.value ) ) {
		return currentFilter.value;
	}

	if ( ! Array.isArray( currentFilter?.value ) && !! currentFilter?.value ) {
		return [ currentFilter.value ];
	}

	return EMPTY_ARRAY;
};
