/**
 * Internal dependencies
 */
import { DomainSuggestionQuery } from './types';
import { State } from './reducer';
import { getSerializedDomainsSuggestionsQuery } from 'state/domains/suggestions/utils';

export const getState = ( state: State ) => state;
export const getDomainSuggestions = ( state: State, queryObject: DomainSuggestionQuery ) => {
	const serializedQuery = getSerializedDomainsSuggestionsQuery( queryObject );
	if ( serializedQuery ) {
		return state.domainSuggestions[ serializedQuery ];
	}
	return null;
};
