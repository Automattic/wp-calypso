/**
 * External dependencies
 */
import type { Reducer } from 'redux';
import { combineReducers } from '@wordpress/data';
import type { DomainSuggestions, Plans } from '@automattic/data-stores';

/**
 * Internal dependencies
 */
import { LaunchStep } from './data';
import type { LaunchStepType } from './types';
import type { LaunchAction } from './actions';

const step: Reducer< LaunchStepType, LaunchAction > = ( state = LaunchStep.Name, action ) => {
	if ( action.type === 'SET_STEP' ) {
		return action.step;
	}
	return state;
};

const domain: Reducer< DomainSuggestions.DomainSuggestion | undefined, LaunchAction > = (
	state,
	action
) => {
	if ( action.type === 'SET_DOMAIN' ) {
		return action.domain;
	}
	if ( action.type === 'UNSET_DOMAIN' ) {
		return undefined;
	}
	return state;
};

const domainSearch: Reducer< string, LaunchAction > = ( state = '', action ) => {
	if ( action.type === 'SET_DOMAIN_SEARCH' ) {
		return action.domainSearch;
	}
	return state;
};

const confirmedDomainSelection: Reducer< boolean, LaunchAction > = ( state = false, action ) => {
	if ( action.type === 'CONFIRM_DOMAIN_SELECTION' ) {
		return true;
	}
	return state;
};

const plan: Reducer< Plans.Plan | undefined, LaunchAction > = ( state, action ) => {
	if ( action.type === 'SET_PLAN' ) {
		return action.plan;
	}
	if ( action.type === 'UNSET_PLAN' ) {
		return undefined;
	}
	return state;
};

const isSidebarOpen: Reducer< boolean, LaunchAction > = ( state = false, action ) => {
	if ( action.type === 'OPEN_SIDEBAR' ) {
		return true;
	}

	if ( action.type === 'CLOSE_SIDEBAR' ) {
		return false;
	}
	return state;
};

const reducer = combineReducers( {
	step,
	domain,
	confirmedDomainSelection,
	domainSearch,
	plan,
	isSidebarOpen,
} );

export type State = ReturnType< typeof reducer >;

export default reducer;
