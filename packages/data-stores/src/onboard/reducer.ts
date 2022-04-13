import { combineReducers } from '@wordpress/data';
import { StoreAddress } from '../shared-types';
import type { DomainSuggestion } from '../domain-suggestions/types';
import type { FeatureId } from '../wpcom-features/types';
import type { OnboardAction } from './actions';
// somewhat hacky, but resolves the circular dependency issue
import type { Design, FontPair } from '@automattic/design-picker/src/types';
import type { Reducer } from 'redux';

const domain: Reducer< DomainSuggestion | undefined, OnboardAction > = ( state, action ) => {
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

const isRedirecting: Reducer< boolean, OnboardAction > = ( state = false, action ) => {
	if ( action.type === 'SET_IS_REDIRECTING' ) {
		return action.isRedirecting;
	}
	// This reducer is intentionally not cleared by 'RESET_ONBOARD_STORE' to prevent
	// a flash of the IntentGathering step after the store is reset.
	return state;
};

const planProductId: Reducer< number | undefined, OnboardAction > = ( state, action ) => {
	if ( action.type === 'SET_PLAN_PRODUCT_ID' ) {
		return action.planProductId;
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

	if ( action.type === 'SET_DOMAIN' && action.domain?.is_free ) {
		return state.filter( ( id ) => id !== 'domain' );
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

const hasOnboardingStarted: Reducer< boolean, OnboardAction > = ( state = false, action ) => {
	if ( action.type === 'ONBOARDING_START' ) {
		return true;
	}
	if ( action.type === 'RESET_ONBOARD_STORE' ) {
		return false;
	}
	return state;
};

const lastLocation: Reducer< string, OnboardAction > = ( state = '', action ) => {
	if ( action.type === 'SET_LAST_LOCATION' ) {
		return action.path;
	}
	if ( action.type === 'RESET_ONBOARD_STORE' ) {
		return '';
	}
	return state;
};

const intent: Reducer< string, OnboardAction > = ( state = '', action ) => {
	if ( action.type === 'SET_INTENT' ) {
		return action.intent;
	}
	if ( action.type === 'RESET_ONBOARD_STORE' ) {
		return '';
	}
	return state;
};

const startingPoint: Reducer< string, OnboardAction > = ( state = '', action ) => {
	if ( action.type === 'SET_STARTING_POINT' ) {
		return action.startingPoint;
	}
	if ( action.type === 'RESET_ONBOARD_STORE' ) {
		return '';
	}
	return state;
};

const storeType: Reducer< string, OnboardAction > = ( state = '', action ) => {
	if ( action.type === 'SET_STORE_TYPE' ) {
		return action.storeType;
	}
	if ( action.type === 'RESET_ONBOARD_STORE' ) {
		return '';
	}
	return state;
};

const storeAddress: Reducer< StoreAddress, OnboardAction > = (
	state = {
		store_address_1: '',
		store_address_2: '',
		store_city: '',
		store_postcode: '',
		store_country: '',
	},
	action
) => {
	if ( action.type === 'SET_STORE_ADDRESS_VALUE' ) {
		const { store_address_field, store_address_value } = action;

		return {
			...state,
			[ store_address_field ]: store_address_value,
		};
	}
	return state;
};

const pendingAction: Reducer< Promise< any > | undefined, OnboardAction > = ( state, action ) => {
	if ( action.type === 'SET_PENDING_ACTION' ) {
		return action.pendingAction;
	}
	if ( action.type === 'RESET_ONBOARD_STORE' ) {
		return undefined;
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
	selectedFeatures,
	storeType,
	selectedFonts,
	selectedDesign,
	selectedSite,
	siteTitle,
	showSignupDialog,
	planProductId,
	randomizedDesigns,
	hasOnboardingStarted,
	lastLocation,
	intent,
	startingPoint,
	storeAddress,
	pendingAction,
} );

export type State = ReturnType< typeof reducer >;

export default reducer;
