/**
 * External dependencies
 */
import { combineReducers } from '@wordpress/data';

/**
 * Internal dependencies
 */
import { ActionType, DomainSuggestion, DomainSuggestionsAction } from './types';
import { stringifyDomainQueryObject } from './utils';

function domainSuggestions(
	state: Record< string, DomainSuggestion[] | undefined > = {},
	action: DomainSuggestionsAction
) {
	if ( action.type === ActionType.RECEIVE_DOMAIN_SUGGESTIONS ) {
		return {
			...state,
			[ stringifyDomainQueryObject( action.queryObject ) ]: action.suggestions,
		};
	}
	return state;
}

const reducer = combineReducers( { domainSuggestions } );

export type State = ReturnType< typeof reducer >;

export default reducer;
