/**
 * External dependencies
 */
import type { Reducer } from 'redux';
import { combineReducers } from '@wordpress/data';
import type { DomainSuggestions, Plans } from '@automattic/data-stores';

/**
 * Internal dependencies
 */
import type { LaunchAction } from './actions';

const domain: Reducer< DomainSuggestions.DomainSuggestion | undefined, LaunchAction > = (
	state,
	action
) => {
	if ( action.type === 'SET_DOMAIN' ) {
		return action.domain;
	}
	return state;
};

const domainSearch: Reducer< string, LaunchAction > = ( state = '', action ) => {
	if ( action.type === 'SET_DOMAIN_SEARCH' ) {
		return action.domainSearch;
	}
	return state;
};

const plan: Reducer< Plans.Plan | undefined, LaunchAction > = ( state, action ) => {
	if ( action.type === 'SET_PLAN' ) {
		return action.plan;
	}
	return state;
};

const reducer = combineReducers( {
	domain,
	domainSearch,
	plan,
} );

export type State = ReturnType< typeof reducer >;

export default reducer;
