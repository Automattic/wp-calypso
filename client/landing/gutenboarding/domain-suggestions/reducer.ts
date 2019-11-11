/**
 * External dependencies
 */
import { Reducer } from 'redux';
import { combineReducers } from '@wordpress/data';

/**
 * Internal dependencies
 */
import { ActionType, DomainSuggestion } from './types';
import * as Actions from './actions';
import { getSerializedDomainsSuggestionsQuery } from 'state/domains/suggestions/utils';

const domainSuggestions: Reducer<
	DomainSuggestion[],
	ReturnType< typeof Actions[ 'receiveDomainSuggestions' ] >
> = ( state = [], action ) => {
	if ( action.type === ActionType.RECEIVE_DOMAIN_SUGGESTIONS ) {
		const serializedQuery =
			action.queryObject && getSerializedDomainsSuggestionsQuery( action.queryObject );
		if ( serializedQuery ) {
			return { ...state, [ serializedQuery ]: action.suggestions };
		}
	}
	return state;
};

const reducer = combineReducers( { domainSuggestions } );

export type State = ReturnType< typeof reducer >;

export default reducer;
