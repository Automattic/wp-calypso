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

const completedSteps: Reducer< LaunchStepType[], LaunchAction > = ( state = [], action ) => {
	if ( action.type === 'SET_STEP_COMPLETE' && state.indexOf( action.step ) === -1 ) {
		return [ ...state, action.step ];
	}
	if ( action.type === 'SET_STEP_INCOMPLETE' ) {
		return state.filter( ( completedStep ) => completedStep !== action.step );
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
	if ( action.type === 'SET_DOMAIN_SEARCH' && action.domainSearch?.length > 1 ) {
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
	completedSteps,
	domain,
	domainSearch,
	plan,
	isSidebarOpen,
} );

export type State = ReturnType< typeof reducer >;

export default reducer;
