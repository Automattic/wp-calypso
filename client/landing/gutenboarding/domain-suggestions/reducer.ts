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

const domainSuggestions: Reducer<
	DomainSuggestion[],
	ReturnType< typeof Actions[ 'receiveDomainSuggestions' ] >
> = ( state = [], action ) => {
	if ( action.type === ActionType.RECEIVE_DOMAIN_SUGGESTIONS ) {
		return action.domainSuggestions;
	}
	return state;
};

const reducer = combineReducers( { domainSuggestions } );

export type State = ReturnType< typeof reducer >;

export default reducer;
