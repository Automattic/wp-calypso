/**
 * External dependencies
 */
import type { Reducer } from 'redux';
import { combineReducers } from '@wordpress/data';

/**
 * Internal dependencies
 */
import type { DomainSuggestion, DomainCategory, DomainAvailability } from './types';
import type { Action } from './actions';
import { stringifyDomainQueryObject } from './utils';

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

const categories: Reducer< DomainCategory[], Action > = ( state = [], action ) => {
	if ( action.type === 'RECEIVE_CATEGORIES' ) {
		return action.categories;
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

const reducer = combineReducers( { categories, domainSuggestions, availability } );

export type State = ReturnType< typeof reducer >;

export default reducer;
