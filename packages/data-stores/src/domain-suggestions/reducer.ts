/**
 * External dependencies
 */
import { Reducer } from 'redux';
import { combineReducers } from '@wordpress/data';

/**
 * Internal dependencies
 */
import { stringifyDomainQueryObject } from './utils';
import type { DomainAvailability, DomainSuggestion } from './types';
import type { Action } from './actions';

const domainSuggestions: Reducer< Record< string, DomainSuggestion[] | undefined >, Action > = (
	state = {},
	action
) => {
	if ( action.type === 'RECEIVE_DOMAIN_SUGGESTIONS' ) {
		return {
			...state,
			[ stringifyDomainQueryObject( action.queryObject ) ]: action.suggestions,
		};
	}
	return state;
};

const availability: Reducer< Record< string, DomainAvailability | undefined >, Action > = (
	state = {},
	action
) => {
	if ( action.type === 'RECEIVE_DOMAIN_AVAILABILITY' ) {
		return {
			...state,
			[ action.domainName ]: action.availability,
		};
	}
	return state;
};

const reducer = combineReducers( { availability, domainSuggestions } );

export type State = ReturnType< typeof reducer >;

export default reducer;
