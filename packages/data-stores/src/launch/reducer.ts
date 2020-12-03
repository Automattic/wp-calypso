/**
 * External dependencies
 */
import type { Reducer } from 'redux';
import { combineReducers } from '@wordpress/data';
import type * as DomainSuggestions from '../domain-suggestions';
import type * as Plans from '../plans';

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

const isFocusedLaunchOpen: Reducer< boolean, LaunchAction > = ( state = false, action ) => {
	if ( action.type === 'OPEN_FOCUSED_LAUNCH' ) {
		return true;
	}

	if ( action.type === 'CLOSE_FOCUSED_LAUNCH' ) {
		return false;
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

const isSidebarFullscreen: Reducer< boolean, LaunchAction > = ( state = false, action ) => {
	if ( action.type === 'SET_SIDEBAR_FULLSCREEN' ) {
		return true;
	}
	if ( action.type === 'UNSET_SIDEBAR_FULLSCREEN' ) {
		return false;
	}
	return state;
};

const isExperimental: Reducer< boolean, LaunchAction > = ( state = false, action ) => {
	if ( action.type === 'ENABLE_EXPERIMENTAL' ) {
		return true;
	}

	return state;
};

const isSiteTitleStepVisible: Reducer< boolean, LaunchAction > = ( state = false, action ) => {
	if ( action.type === 'SHOW_SITE_TITLE_STEP' ) {
		return true;
	}

	return state;
};

const isModalDismissible: Reducer< boolean, LaunchAction > = ( state = true, action ) => {
	if ( action.type === 'SET_MODAL_DISMISSIBLE' ) {
		return true;
	}

	if ( action.type === 'UNSET_MODAL_DISMISSIBLE' ) {
		return false;
	}

	return state;
};

const isModalTitleVisible: Reducer< boolean, LaunchAction > = ( state = true, action ) => {
	if ( action.type === 'SHOW_MODAL_TITLE' ) {
		return true;
	}

	if ( action.type === 'HIDE_MODAL_TITLE' ) {
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
	isSidebarFullscreen,
	isExperimental,
	isFocusedLaunchOpen,
	isSiteTitleStepVisible,
	isModalDismissible,
	isModalTitleVisible,
} );

export type State = ReturnType< typeof reducer >;

export default reducer;
