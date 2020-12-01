/**
 * External dependencies
 */
import type { Reducer } from 'redux';
import { combineReducers } from '@wordpress/data';
import type { DomainSuggestions, Plans, WPCOMFeatures } from '@automattic/data-stores';

/**
 * Internal dependencies
 */
import type { SiteVertical, Design } from './types';
import type { OnboardAction } from './actions';
import type { FontPair } from '../../constants';

type FeatureId = WPCOMFeatures.FeatureId;

// Returns true if the url has a `?latest`, which is used to enable experimental features
export function hasExperimentalQueryParam() {
	if ( typeof window !== 'undefined' ) {
		return new URLSearchParams( window.location.search ).has( 'latest' );
	}
	return false;
}

const domain: Reducer< DomainSuggestions.DomainSuggestion | undefined, OnboardAction > = (
	state,
	action
) => {
	if ( action.type === 'SET_DOMAIN' ) {
		return action.domain;
	}
	if ( action.type === 'RESET_ONBOARD_STORE' ) {
		return undefined;
	}
	return state;
};

const domainSearch: Reducer< string, OnboardAction > = ( state = '', action ) => {
	if ( action.type === 'SET_DOMAIN_SEARCH_TERM' ) {
		return action.domainSearch;
	}
	if ( action.type === 'RESET_ONBOARD_STORE' ) {
		return '';
	}
	return state;
};

const domainCategory: Reducer< string | undefined, OnboardAction > = ( state, action ) => {
	if ( action.type === 'SET_DOMAIN_CATEGORY' ) {
		return action.domainCategory;
	}
	if ( action.type === 'RESET_ONBOARD_STORE' ) {
		return undefined;
	}
	return state;
};

const hasUsedDomainsStep: Reducer< boolean, OnboardAction > = ( state = false, action ) => {
	if ( action.type === 'SET_HAS_USED_DOMAINS_STEP' ) {
		return action.hasUsedDomainsStep;
	}
	if ( action.type === 'RESET_ONBOARD_STORE' ) {
		return false;
	}
	return state;
};

const hasUsedPlansStep: Reducer< boolean, OnboardAction > = ( state = false, action ) => {
	if ( action.type === 'SET_HAS_USED_PLANS_STEP' ) {
		return action.hasUsedPlansStep;
	}
	if ( action.type === 'RESET_ONBOARD_STORE' ) {
		return false;
	}
	return state;
};

const isExperimental: Reducer< boolean, OnboardAction > = (
	state = hasExperimentalQueryParam(),
	action
) => {
	if ( action.type === 'RESET_ONBOARD_STORE' ) {
		return false;
	}
	return state;
};

const isRedirecting: Reducer< boolean, OnboardAction > = ( state = false, action ) => {
	if ( action.type === 'SET_IS_REDIRECTING' ) {
		return action.isRedirecting;
	}
	// This reducer is intentionally not cleared by 'RESET_ONBOARD_STORE' to prevent
	// a flash of the IntentGathering step after the store is reset.
	return state;
};

const pageLayouts: Reducer< string[], OnboardAction > = ( state = [], action ) => {
	if ( action.type === 'TOGGLE_PAGE_LAYOUT' ) {
		const layout = action.pageLayout;
		if ( state.includes( layout.slug ) ) {
			return state.filter( ( item ) => item !== layout.slug );
		}
		return [ ...state, layout.slug ];
	}
	if ( action.type === 'RESET_ONBOARD_STORE' ) {
		return [];
	}
	return state;
};

const plan: Reducer< Plans.Plan | undefined, OnboardAction > = ( state, action ) => {
	if ( action.type === 'SET_PLAN' ) {
		return action.plan;
	}
	if ( action.type === 'RESET_ONBOARD_STORE' ) {
		return undefined;
	}
	return state;
};

const randomizedDesigns: Reducer< { featured: Design[] }, OnboardAction > = (
	state = { featured: [] },
	action
) => {
	if ( action.type === 'SET_RANDOMIZED_DESIGNS' ) {
		return action.randomizedDesigns;
	}
	if ( action.type === 'RESET_ONBOARD_STORE' ) {
		return { featured: [] };
	}
	return state;
};

const selectedFonts: Reducer< FontPair | undefined, OnboardAction > = (
	state = undefined,
	action
) => {
	if ( action.type === 'SET_FONTS' ) {
		return action.fonts;
	}
	if ( action.type === 'RESET_FONTS' || action.type === 'RESET_ONBOARD_STORE' ) {
		return undefined;
	}
	return state;
};

const selectedDesign: Reducer< Design | undefined, OnboardAction > = ( state, action ) => {
	if ( action.type === 'SET_SELECTED_DESIGN' ) {
		return action.selectedDesign;
	}
	if ( action.type === 'RESET_ONBOARD_STORE' ) {
		return undefined;
	}
	return state;
};

const selectedFeatures: Reducer< FeatureId[], OnboardAction > = (
	state: FeatureId[] = [],
	action
) => {
	if ( action.type === 'ADD_FEATURE' ) {
		return [ ...state, action.featureId ];
	}

	if ( action.type === 'SET_DOMAIN' && action.domain && ! action.domain?.is_free ) {
		return [ ...state, 'domain' ];
	}

	if ( action.type === 'REMOVE_FEATURE' ) {
		return state.filter( ( id ) => id !== action.featureId );
	}

	if ( action.type === 'RESET_ONBOARD_STORE' ) {
		return [];
	}

	return state;
};

const selectedSite: Reducer< number | undefined, OnboardAction > = (
	state = undefined,
	action
) => {
	if ( action.type === 'SET_SELECTED_SITE' ) {
		return action.selectedSite;
	}
	if ( action.type === 'RESET_ONBOARD_STORE' ) {
		return undefined;
	}
	return state;
};

const showSignupDialog: Reducer< boolean, OnboardAction > = ( state = false, action ) => {
	if ( action.type === 'SET_SHOW_SIGNUP_DIALOG' ) {
		return action.showSignup;
	}
	if ( action.type === 'RESET_ONBOARD_STORE' ) {
		return false;
	}
	return state;
};

const siteTitle: Reducer< string, OnboardAction > = ( state = '', action ) => {
	if ( action.type === 'SET_SITE_TITLE' ) {
		return action.siteTitle;
	}
	if ( action.type === 'RESET_ONBOARD_STORE' ) {
		return '';
	}
	return state;
};

const siteVertical: Reducer< SiteVertical | undefined, OnboardAction > = ( state, action ) => {
	if ( action.type === 'SET_SITE_VERTICAL' ) {
		return action.siteVertical;
	}
	if ( action.type === 'RESET_SITE_VERTICAL' || action.type === 'RESET_ONBOARD_STORE' ) {
		return undefined;
	}
	return state;
};

const wasVerticalSkipped: Reducer< boolean, OnboardAction > = ( state = false, action ) => {
	if ( action.type === 'SKIP_SITE_VERTICAL' ) {
		return true;
	}
	if ( action.type === 'RESET_ONBOARD_STORE' ) {
		return false;
	}
	return state;
};

const hasOnboardingStarted: Reducer< boolean, OnboardAction > = ( state = false, action ) => {
	if ( action.type === 'ONBOARDING_START' ) {
		return true;
	}
	if ( action.type === 'RESET_ONBOARD_STORE' ) {
		return false;
	}
	return state;
};

const reducer = combineReducers( {
	domain,
	domainSearch,
	domainCategory,
	isRedirecting,
	hasUsedDomainsStep,
	hasUsedPlansStep,
	pageLayouts,
	selectedFeatures,
	selectedFonts,
	selectedDesign,
	selectedSite,
	siteTitle,
	siteVertical,
	showSignupDialog,
	plan,
	wasVerticalSkipped,
	isExperimental,
	randomizedDesigns,
	hasOnboardingStarted,
} );

export type State = ReturnType< typeof reducer >;

export default reducer;
