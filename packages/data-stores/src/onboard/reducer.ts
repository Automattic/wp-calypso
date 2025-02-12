import { combineReducers } from '@wordpress/data';
import { SiteGoal } from './constants';
import type { OnboardAction } from './actions';
import type {
	DomainForm,
	ProfilerData,
	DomainTransferNames,
	DomainTransferAuthCodes,
	ReadymadeTemplate,
} from './types';
import type { DomainSuggestion } from '../domain-suggestions';
import type { FeatureId } from '../shared-types';
import type { GlobalStyles } from '../site';
// somewhat hacky, but resolves the circular dependency issue
import type { Design, StyleVariation } from '@automattic/design-picker/src/types';
import type { MinimalRequestCartProduct } from '@automattic/shopping-cart';
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

const siteUrl: Reducer< string | undefined, OnboardAction > = ( state, action ) => {
	if ( action.type === 'SET_SITE_URL' ) {
		return action.siteUrl;
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

const selectedDesign: Reducer< Design | undefined, OnboardAction > = ( state, action ) => {
	if ( action.type === 'SET_SELECTED_DESIGN' ) {
		return action.selectedDesign;
	}

	if (
		action.type === 'RESET_ONBOARD_STORE' &&
		action?.skipFlags?.includes( 'skipSelectedDesign' )
	) {
		return state;
	}

	if ( [ 'RESET_SELECTED_DESIGN', 'RESET_ONBOARD_STORE' ].includes( action.type ) ) {
		return undefined;
	}
	return state;
};

const selectedStyleVariation: Reducer< StyleVariation | undefined, OnboardAction > = (
	state,
	action
) => {
	if ( action.type === 'SET_SELECTED_STYLE_VARIATION' ) {
		return action.selectedStyleVariation;
	}
	if ( [ 'RESET_SELECTED_STYLE_VARIATION', 'RESET_ONBOARD_STORE' ].includes( action.type ) ) {
		return undefined;
	}
	return state;
};

const selectedGlobalStyles: Reducer< GlobalStyles | undefined, OnboardAction > = (
	state,
	action
) => {
	switch ( action.type ) {
		case 'SET_SELECTED_GLOBAL_STYLES':
			return action.selectedGlobalStyles;

		case 'RESET_ONBOARD_STORE':
			return undefined;

		default:
			return state;
	}
};

const readymadeTemplate: Reducer< ReadymadeTemplate | undefined, OnboardAction > = (
	state = undefined, // Initial state is set to undefined
	action
) => {
	switch ( action.type ) {
		case 'SET_READYMADE_TEMPLATE':
			return action.readymadeTemplate;

		case 'RESET_ONBOARD_STORE':
			return undefined;

		default:
			return state;
	}
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

const siteDescription: Reducer< string, OnboardAction > = ( state = '', action ) => {
	if ( action.type === 'SET_SITE_DESCRIPTION' ) {
		return action.siteDescription;
	}
	if ( action.type === 'RESET_ONBOARD_STORE' ) {
		return '';
	}
	return state;
};

const siteLogo: Reducer< null | string, OnboardAction > = ( state = null, action ) => {
	if ( action.type === 'SET_SITE_LOGO' ) {
		return action.siteLogo;
	}
	if ( action.type === 'RESET_ONBOARD_STORE' ) {
		return null;
	}
	return state;
};

const productCartItems: Reducer< MinimalRequestCartProduct[] | null, OnboardAction > = (
	state = [],
	action
) => {
	if ( action.type === 'SET_PRODUCT_CART_ITEMS' ) {
		return action.productCartItems;
	}
	if ( action.type === 'RESET_ONBOARD_STORE' ) {
		return [];
	}
	return state;
};

const planCartItem: Reducer< MinimalRequestCartProduct | null, OnboardAction > = (
	state = null,
	action
) => {
	if ( action.type === 'SET_PLAN_CART_ITEM' ) {
		return action.planCartItem;
	}
	if ( action.type === 'RESET_ONBOARD_STORE' ) {
		return null;
	}
	return state;
};

const siteAccentColor: Reducer< string, OnboardAction > = ( state = '', action ) => {
	if ( action.type === 'SET_SITE_ACCENT_COLOR' ) {
		return action.siteAccentColor;
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
	if ( action.type === 'RESET_ONBOARD_STORE' && action?.skipFlags?.includes( 'skipIntent' ) ) {
		return state;
	}
	if ( [ 'RESET_INTENT', 'RESET_ONBOARD_STORE' ].includes( action.type ) ) {
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

const pendingAction: Reducer< undefined | ( () => Promise< any > ), OnboardAction > = (
	state,
	action
) => {
	if ( action.type === 'SET_PENDING_ACTION' ) {
		return action.pendingAction;
	}
	if (
		action.type === 'RESET_ONBOARD_STORE' &&
		! action.skipFlags.includes( 'skipPendingAction' )
	) {
		return undefined;
	}
	return state;
};

const progress: Reducer< number | undefined, OnboardAction > = ( state, action ) => {
	if ( action.type === 'SET_PROGRESS' ) {
		return action.progress;
	}
	if ( action.type === 'RESET_ONBOARD_STORE' ) {
		return undefined;
	}
	return state;
};

const progressTitle: Reducer< string | undefined, OnboardAction > = ( state, action ) => {
	if ( action.type === 'SET_PROGRESS_TITLE' ) {
		return action.progressTitle;
	}
	if ( action.type === 'RESET_ONBOARD_STORE' ) {
		return undefined;
	}
	return state;
};

const goals: Reducer< SiteGoal[], OnboardAction > = ( state = [], action ) => {
	if ( action.type === 'SET_GOALS' ) {
		return [ ...action.goals ];
	}
	if ( action.type === 'CLEAR_IMPORT_GOAL' ) {
		return state.filter( ( goal ) => goal !== SiteGoal.Import );
	}
	if ( action.type === 'CLEAR_DIFM_GOAL' ) {
		return state.filter( ( goal ) => goal !== SiteGoal.DIFM );
	}
	if ( action.type === 'RESET_ONBOARD_STORE' && action?.skipFlags?.includes( 'skipGoals' ) ) {
		return state;
	}

	if ( [ 'RESET_GOALS', 'RESET_ONBOARD_STORE' ].includes( action.type ) ) {
		return [];
	}

	return state;
};

const verticalId: Reducer< string, OnboardAction > = ( state = '', action ) => {
	if ( action.type === 'SET_VERTICAL_ID' ) {
		return action.verticalId;
	}
	if ( action.type === 'RESET_ONBOARD_STORE' ) {
		return '';
	}
	return state;
};

const storeLocationCountryCode: Reducer< string, OnboardAction > = ( state = '', action ) => {
	if ( action.type === 'SET_STORE_LOCATION_COUNTRY_CODE' ) {
		return action.storeLocationCountryCode;
	}
	if ( action.type === 'RESET_ONBOARD_STORE' ) {
		return '';
	}
	return state;
};

const ecommerceFlowRecurType: Reducer< string, OnboardAction > = ( state = '', action ) => {
	if ( action.type === 'SET_ECOMMERCE_FLOW_RECUR_TYPE' ) {
		return action.ecommerceFlowRecurType;
	}
	if ( action.type === 'RESET_ONBOARD_STORE' ) {
		return '';
	}
	return state;
};

const couponCode: Reducer< string, OnboardAction > = ( state = '', action ) => {
	if ( action.type === 'SET_COUPON_CODE' ) {
		return action.couponCode;
	}
	if ( [ 'RESET_COUPON_CODE', 'RESET_ONBOARD_STORE' ].includes( action.type ) ) {
		return '';
	}
	return state;
};

const storageAddonSlug: Reducer< string, OnboardAction > = ( state = '', action ) => {
	if ( action.type === 'SET_STORAGE_ADDON_SLUG' ) {
		return action.storageAddonSlug;
	}
	if ( [ 'RESET_STORAGE_ADDON_SLUG', 'RESET_ONBOARD_STORE' ].includes( action.type ) ) {
		return '';
	}
	return state;
};

const domainForm: Reducer< DomainForm, OnboardAction > = ( state = {}, action ) => {
	if ( action.type === 'SET_DOMAIN_FORM' ) {
		return {
			...state,
			...action.step,
		};
	}
	if ( action.type === 'RESET_ONBOARD_STORE' ) {
		return {};
	}

	return state;
};

const hideFreePlan: Reducer< boolean, OnboardAction > = ( state = false, action ) => {
	if ( action.type === 'SET_HIDE_FREE_PLAN' ) {
		return action.hideFreePlan;
	}
	if ( action.type === 'RESET_ONBOARD_STORE' ) {
		return false;
	}
	return state;
};

const hidePlansFeatureComparison: Reducer< boolean, OnboardAction > = ( state = false, action ) => {
	if ( action.type === 'SET_HIDE_PLANS_FEATURE_COMPARISON' ) {
		return action.hidePlansFeatureComparison;
	}
	if ( action.type === 'RESET_ONBOARD_STORE' ) {
		return false;
	}
	return state;
};

const domainCartItem: Reducer< MinimalRequestCartProduct | undefined, OnboardAction > = (
	state = undefined,
	action
) => {
	if ( action.type === 'SET_DOMAIN_CART_ITEM' ) {
		return action.domainCartItem;
	}
	if ( action.type === 'RESET_ONBOARD_STORE' ) {
		return undefined;
	}

	return state;
};

const domainCartItems: Reducer< MinimalRequestCartProduct[] | undefined, OnboardAction > = (
	state = undefined,
	action
) => {
	if ( action.type === 'SET_DOMAIN_CART_ITEMS' ) {
		return action.domainCartItems;
	}
	if ( action.type === 'RESET_ONBOARD_STORE' ) {
		return undefined;
	}

	return state;
};

const isMigrateFromWp: Reducer< boolean, OnboardAction > = ( state = false, action ) => {
	if ( action.type === 'SET_IS_MIGRATE_FROM_WP' ) {
		return action.isMigrateFromWp;
	}
	if ( action.type === 'RESET_ONBOARD_STORE' ) {
		return false;
	}
	return state;
};

const pluginsToVerify: Reducer< string[] | undefined, OnboardAction > = ( state, action ) => {
	if ( action.type === 'SET_PLUGIN_SLUGS_TO_VERIFY' ) {
		return action.pluginSlugs;
	}
	if ( action.type === 'RESET_ONBOARD_STORE' ) {
		return undefined;
	}
	return state;
};

export const profilerData: Reducer< ProfilerData | undefined, OnboardAction > = (
	state,
	action
) => {
	if ( action.type === 'SET_PROFILER_DATA' ) {
		return action.profilerData;
	}
	if ( action.type === 'RESET_ONBOARD_STORE' ) {
		return undefined;
	}
	return state;
};

export const domainTransferNames: Reducer< DomainTransferNames | undefined, OnboardAction > = (
	state,
	action
) => {
	if ( action.type === 'SET_DOMAINS_TRANSFER_DATA' ) {
		// we don't want to store empty objects
		if ( action.bulkDomainsData && Object.keys( action.bulkDomainsData ).length > 0 ) {
			// remove auth codes for safety
			return Object.entries( action.bulkDomainsData ).reduce(
				( domainTransferNames, [ key, value ] ) => {
					domainTransferNames[ key ] = value.domain;
					return domainTransferNames;
				},
				{} as DomainTransferNames
			);
		}
		return undefined;
	}
	if ( action.type === 'RESET_ONBOARD_STORE' ) {
		return undefined;
	}
	return state;
};

/**
 * A separate reducer for auth codes to avoid persisting sensitive data.
 */
export const domainTransferAuthCodes: Reducer<
	DomainTransferAuthCodes | undefined,
	OnboardAction
> = ( state, action ) => {
	if ( action.type === 'SET_DOMAINS_TRANSFER_DATA' ) {
		// we don't want to store empty objects
		if ( action.bulkDomainsData && Object.keys( action.bulkDomainsData ).length > 0 ) {
			return Object.entries( action.bulkDomainsData ).reduce( ( authCodes, [ key, value ] ) => {
				authCodes[ key ] = {
					auth: value.auth,
					valid: value.valid,
					rawPrice: value.rawPrice,
					saleCost: value.saleCost,
					currencyCode: value.currencyCode,
				};
				return authCodes;
			}, {} as DomainTransferAuthCodes );
		}
		return undefined;
	}
	if ( action.type === 'RESET_ONBOARD_STORE' ) {
		return undefined;
	}
	return state;
};

export const shouldImportDomainTransferDnsRecords: Reducer< boolean, OnboardAction > = (
	state = true,
	action
) => {
	if ( action.type === 'SET_SHOULD_IMPORT_DOMAIN_TRANSFER_DNS_RECORDS' ) {
		return action.shouldImportDomainTransferDnsRecords;
	}
	if ( action.type === 'RESET_ONBOARD_STORE' ) {
		return true;
	}
	return state;
};

const paidSubscribers: Reducer< boolean, OnboardAction > = ( state = false, action ) => {
	if ( action.type === 'SET_PAID_SUBSCRIBERS' ) {
		return action.paidSubscribers;
	}
	if ( action.type === 'RESET_ONBOARD_STORE' ) {
		return false;
	}
	return state;
};

const partnerBundle: Reducer< string | null, OnboardAction > = ( state = null, action ) => {
	if ( action.type === 'SET_PARTNER_BUNDLE' ) {
		return action.partnerBundle;
	}
	if ( action.type === 'RESET_ONBOARD_STORE' ) {
		return null;
	}
	return state;
};

const signupDomainOrigin: Reducer< string | undefined, OnboardAction > = (
	state = undefined,
	action
) => {
	if ( action.type === 'SET_SIGNUP_DOMAIN_ORIGIN' ) {
		return action.signupDomainOrigin;
	}
	if ( action.type === 'RESET_ONBOARD_STORE' ) {
		return undefined;
	}

	return state;
};

const createWithBigSky: Reducer< boolean | undefined, OnboardAction > = (
	state = undefined,
	action
) => {
	if ( action.type === 'SET_CREATE_WITH_BIG_SKY' ) {
		return action.createWithBigSky;
	}
	if ( action.type === 'RESET_ONBOARD_STORE' ) {
		return undefined;
	}

	return state;
};

const reducer = combineReducers( {
	domain,
	domainCartItem,
	domainSearch,
	domainCategory,
	domainForm,
	siteUrl,
	isRedirecting,
	hasUsedDomainsStep,
	hasUsedPlansStep,
	selectedFeatures,
	domainTransferNames,
	domainTransferAuthCodes,
	shouldImportDomainTransferDnsRecords,
	storeType,
	selectedDesign,
	selectedStyleVariation,
	selectedGlobalStyles,
	selectedSite,
	siteTitle,
	showSignupDialog,
	planProductId,
	randomizedDesigns,
	hasOnboardingStarted,
	lastLocation,
	intent,
	startingPoint,
	pendingAction,
	progress,
	progressTitle,
	goals,
	hideFreePlan,
	hidePlansFeatureComparison,
	siteDescription,
	siteLogo,
	siteAccentColor,
	readymadeTemplate,
	verticalId,
	storeLocationCountryCode,
	ecommerceFlowRecurType,
	couponCode,
	storageAddonSlug,
	planCartItem,
	productCartItems,
	isMigrateFromWp,
	domainCartItems,
	pluginsToVerify,
	profilerData,
	paidSubscribers,
	partnerBundle,
	signupDomainOrigin,
	createWithBigSky,
} );

export type State = ReturnType< typeof reducer >;

export default reducer;
