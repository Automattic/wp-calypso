import config from '@automattic/calypso-config';
import { guessTimezone, getLanguage } from '@automattic/i18n-utils';
import { dispatch, select } from '@wordpress/data-controls';
import { __ } from '@wordpress/i18n';
import { STORE_KEY as SITE_STORE } from '../site';
import { CreateSiteParams, Visibility, NewSiteBlogDetails } from '../site/types';
import { SiteGoal, STORE_KEY } from './constants';
import { ProfilerData } from './types';
import type { DomainTransferData, State } from '.';
import type { DomainSuggestion } from '../domain-suggestions';
import type { FeatureId } from '../shared-types';
// somewhat hacky, but resolves the circular dependency issue
import type { Design, FontPair, StyleVariation } from '@automattic/design-picker/src/types';
import type { MinimalRequestCartProduct } from '@automattic/shopping-cart';

// copied from design picker to avoid a circular dependency
function isBlankCanvasDesign( design: { slug: string } | undefined ): boolean {
	if ( ! design ) {
		return false;
	}
	return /blank-canvas/i.test( design.slug );
}

type Language = {
	value: number;
};

export const addFeature = ( featureId: FeatureId ) => ( {
	type: 'ADD_FEATURE' as const,
	featureId,
} );

export interface CreateSiteBaseActionParameters {
	username: string;
	languageSlug: string;
	visibility: number;
}

export interface CreateSiteActionParameters extends CreateSiteBaseActionParameters {
	bearerToken?: string;
	anchorFmPodcastId: string | null;
	anchorFmEpisodeId: string | null;
	anchorFmSpotifyUrl: string | null;
}

export function* createVideoPressSite( {
	username,
	languageSlug,
	visibility = Visibility.PublicNotIndexed,
}: CreateSiteBaseActionParameters ) {
	const { domain, selectedDesign, selectedFonts, siteTitle, selectedFeatures }: State =
		yield select( STORE_KEY, 'getState' );

	const siteUrl = domain?.domain_name || siteTitle || username;
	const lang_id = ( getLanguage( languageSlug ) as Language )?.value;
	const siteVertical = 'videomaker';
	const blogTitle = siteTitle.trim() === '' ? __( 'Site Title' ) : siteTitle;
 
	const params: CreateSiteParams = {
		blog_name: siteUrl?.split( '.wordpress' )[ 0 ],
		blog_title: blogTitle,
		public: visibility,
		options: {
			site_information: {
				title: blogTitle,
			},
			lang_id: lang_id,
			site_creation_flow: 'videopress',
			enable_fse: true,
			theme: 'pub/videomaker',
			timezone_string: guessTimezone(),
			...( selectedDesign?.template && { template: selectedDesign.template } ),
			...( selectedFonts && {
				font_base: selectedFonts.base,
				font_headings: selectedFonts.headings,
			} ),
			use_patterns: true,
			site_vertical_name: siteVertical,
			selected_features: selectedFeatures,
			wpcom_public_coming_soon: 1,
			...( selectedDesign && { is_blank_canvas: isBlankCanvasDesign( selectedDesign ) } ),
			is_videopress_initial_purchase: true,
		},
	};

	const success: NewSiteBlogDetails | undefined = yield dispatch(
		SITE_STORE,
		'createSite',
		params
	);

	return success;
}

export function* createVideoPressTvSite( {
	languageSlug,
	visibility = Visibility.PublicNotIndexed,
}: CreateSiteBaseActionParameters ) {
	const { selectedDesign, selectedFonts, selectedFeatures }: State = yield select(
		STORE_KEY,
		'getState'
	);

	const lang_id = ( getLanguage( languageSlug ) as Language )?.value;
	const blogTitle = 'VideoPress TV';

	const params: CreateSiteParams = {
		blog_name: '', // will be replaced on server with random domain
		blog_title: blogTitle,
		public: visibility,
		options: {
			site_information: {
				title: blogTitle,
			},
			lang_id: lang_id,
			site_creation_flow: 'videopress-tv',
			enable_fse: true,
			theme: 'pub/videopress-hq',
			timezone_string: guessTimezone(),
			...( selectedDesign?.template && { template: selectedDesign.template } ),
			...( selectedFonts && {
				font_base: selectedFonts.base,
				font_headings: selectedFonts.headings,
			} ),
			use_patterns: true,
			selected_features: selectedFeatures,
			wpcom_public_coming_soon: 1,
			...( selectedDesign && { is_blank_canvas: isBlankCanvasDesign( selectedDesign ) } ),
			is_videopress_initial_purchase: true,
		},
	};

	const success: NewSiteBlogDetails | undefined = yield dispatch(
		SITE_STORE,
		'createSite',
		params
	);

	return success;
}

export function* createSenseiSite( {
	username = '',
	languageSlug = '',
	visibility = Visibility.PublicNotIndexed,
} ) {
	const { domain, selectedDesign, selectedFonts, siteTitle, selectedFeatures }: State =
		yield select( STORE_KEY, 'getState' );

	const siteUrl = domain?.domain_name || siteTitle || username;
	const lang_id = ( getLanguage( languageSlug ) as Language )?.value;
	const blogTitle = siteTitle.trim() === '' ? __( 'Site Title' ) : siteTitle;

	const success: boolean | undefined = yield dispatch( SITE_STORE, 'createSite', {
		blog_name: siteUrl?.split( '.wordpress' )[ 0 ],
		blog_title: blogTitle,
		public: visibility,
		options: {
			site_information: {
				title: blogTitle,
			},
			lang_id: lang_id,
			site_creation_flow: 'sensei',
			enable_fse: true,
			theme: 'pub/course',
			timezone_string: guessTimezone(),
			...( selectedDesign?.template && { template: selectedDesign.template } ),
			...( selectedFonts && {
				font_base: selectedFonts.base,
				font_headings: selectedFonts.headings,
			} ),
			use_patterns: true,
			site_intent: 'sensei',
			selected_features: selectedFeatures,
			wpcom_public_coming_soon: 1,
			...( selectedDesign && { is_blank_canvas: isBlankCanvasDesign( selectedDesign ) } ),
		},
	} );

	return success;
}

export function* createSite( {
	username,
	languageSlug,
	bearerToken = undefined,
	visibility = Visibility.PublicNotIndexed,
	anchorFmPodcastId = null,
	anchorFmEpisodeId = null,
	anchorFmSpotifyUrl = null,
}: CreateSiteActionParameters ) {
	const { domain, selectedDesign, selectedFonts, siteTitle, selectedFeatures }: State =
		yield select( STORE_KEY, 'getState' );

	const siteUrl = domain?.domain_name || siteTitle || username;
	const lang_id = ( getLanguage( languageSlug ) as Language )?.value;
	const defaultTheme = 'zoologist';
	const blogTitle = siteTitle.trim() === '' ? __( 'Site Title' ) : siteTitle;

	const params: CreateSiteParams = {
		blog_name: siteUrl?.split( '.wordpress' )[ 0 ],
		blog_title: blogTitle,
		public: visibility,
		options: {
			site_information: {
				title: blogTitle,
			},
			lang_id: lang_id,
			site_creation_flow: 'gutenboarding',
			enable_fse: true,
			theme: `pub/${ selectedDesign?.theme || defaultTheme }`,
			timezone_string: guessTimezone(),
			...( selectedDesign?.template && { template: selectedDesign.template } ),
			...( selectedFonts && {
				font_base: selectedFonts.base,
				font_headings: selectedFonts.headings,
			} ),
			use_patterns: true,
			selected_features: selectedFeatures,
			wpcom_public_coming_soon: 1,
			...( anchorFmPodcastId && {
				anchor_fm_podcast_id: anchorFmPodcastId,
			} ),
			...( anchorFmEpisodeId && {
				anchor_fm_episode_id: anchorFmEpisodeId,
			} ),
			...( anchorFmSpotifyUrl && {
				anchor_fm_spotify_url: anchorFmSpotifyUrl,
			} ),
			...( selectedDesign && { is_blank_canvas: isBlankCanvasDesign( selectedDesign ) } ),
		},
		...( bearerToken && { authToken: bearerToken } ),
	};
	const success: NewSiteBlogDetails | undefined = yield dispatch(
		SITE_STORE,
		'createSite',
		params
	);

	return success;
}

export const removeFeature = ( featureId: FeatureId ) => ( {
	type: 'REMOVE_FEATURE' as const,
	featureId,
} );

export const resetFonts = () => ( {
	type: 'RESET_FONTS' as const,
} );

export const resetOnboardStore = () => ( {
	type: 'RESET_ONBOARD_STORE' as const,
	skipFlags: [] as string[],
} );

export const resetOnboardStoreWithSkipFlags = ( skipFlags: string[] ) => ( {
	type: 'RESET_ONBOARD_STORE' as const,
	skipFlags,
} );

export const setDomain = ( domain: DomainSuggestion | undefined ) => ( {
	type: 'SET_DOMAIN' as const,
	domain,
} );

export const setDomainCategory = ( domainCategory: string | undefined ) => ( {
	type: 'SET_DOMAIN_CATEGORY' as const,
	domainCategory,
} );

export const setDomainSearch = ( domainSearch: string ) => ( {
	type: 'SET_DOMAIN_SEARCH_TERM' as const,
	domainSearch,
} );

export const setFonts = ( fonts: FontPair | undefined ) => {
	return {
		type: 'SET_FONTS' as const,
		fonts: fonts,
	};
};

export const setHasUsedDomainsStep = ( hasUsedDomainsStep: boolean ) => ( {
	type: 'SET_HAS_USED_DOMAINS_STEP' as const,
	hasUsedDomainsStep,
} );

export const setHasUsedPlansStep = ( hasUsedPlansStep: boolean ) => ( {
	type: 'SET_HAS_USED_PLANS_STEP' as const,
	hasUsedPlansStep,
} );

export const setIsRedirecting = ( isRedirecting: boolean ) => ( {
	type: 'SET_IS_REDIRECTING' as const,
	isRedirecting,
} );

export const setLastLocation = ( path: string ) => ( {
	type: 'SET_LAST_LOCATION' as const,
	path,
} );

export const setPlanProductId = ( planProductId: number | undefined ) => ( {
	type: 'SET_PLAN_PRODUCT_ID' as const,
	planProductId,
} );

export const setPlanCartItem = ( planCartItem: MinimalRequestCartProduct | null ) => ( {
	type: 'SET_PLAN_CART_ITEM' as const,
	planCartItem,
} );

export const setProductCartItems = ( productCartItems: MinimalRequestCartProduct[] | null ) => ( {
	type: 'SET_PRODUCT_CART_ITEMS' as const,
	productCartItems,
} );

export const setRandomizedDesigns = ( randomizedDesigns: { featured: Design[] } ) => ( {
	type: 'SET_RANDOMIZED_DESIGNS' as const,
	randomizedDesigns,
} );

export const setSelectedDesign = ( selectedDesign: Design | undefined ) => ( {
	type: 'SET_SELECTED_DESIGN' as const,
	selectedDesign,
} );

export const setSelectedStyleVariation = (
	selectedStyleVariation: StyleVariation | undefined
) => ( {
	type: 'SET_SELECTED_STYLE_VARIATION' as const,
	selectedStyleVariation,
} );

export const setSelectedSite = ( selectedSite: number | undefined ) => ( {
	type: 'SET_SELECTED_SITE' as const,
	selectedSite,
} );

export const setShowSignupDialog = ( showSignup: boolean ) => ( {
	type: 'SET_SHOW_SIGNUP_DIALOG' as const,
	showSignup,
} );

export const setSiteTitle = ( siteTitle: string ) => ( {
	type: 'SET_SITE_TITLE' as const,
	siteTitle,
} );

export const setSiteGeoAffinity = ( siteGeoAffinity: string ) => ( {
	type: 'SET_SITE_GEO_AFFINITY' as const,
	siteGeoAffinity,
} );

export const setSiteDescription = ( siteDescription: string ) => ( {
	type: 'SET_SITE_DESCRIPTION' as const,
	siteDescription,
} );

export const setSiteLogo = ( siteLogo: string | null ) => ( {
	type: 'SET_SITE_LOGO' as const,
	siteLogo,
} );

export const setSiteAccentColor = ( siteAccentColor: string ) => ( {
	type: 'SET_SITE_ACCENT_COLOR' as const,
	siteAccentColor,
} );

export const setAnchorPodcastId = ( anchorPodcastId: string | null ) => ( {
	type: 'SET_ANCHOR_PODCAST_ID' as const,
	anchorPodcastId,
} );

export const setAnchorEpisodeId = ( anchorEpisodeId: string | null ) => ( {
	type: 'SET_ANCHOR_PODCAST_EPISODE_ID' as const,
	anchorEpisodeId,
} );

export const setAnchorSpotifyUrl = ( anchorSpotifyUrl: string | null ) => ( {
	type: 'SET_ANCHOR_PODCAST_SPOTIFY_URL' as const,
	anchorSpotifyUrl,
} );

export function updatePlan( planProductId: number ) {
	// keep updatePlan for backwards compat
	return setPlanProductId( planProductId );
}

export const startOnboarding = () => ( {
	type: 'ONBOARDING_START' as const,
} );

export const setIntent = ( intent: string ) => ( {
	type: 'SET_INTENT' as const,
	intent,
} );

export const setStartingPoint = ( startingPoint: string ) => ( {
	type: 'SET_STARTING_POINT' as const,
	startingPoint,
} );

export const setStoreType = ( storeType: string ) => ( {
	type: 'SET_STORE_TYPE' as const,
	storeType,
} );

export const setStoreAddressValue = (
	store_address_field: string,
	store_address_value: string
) => ( {
	type: 'SET_STORE_ADDRESS_VALUE' as const,
	store_address_field,
	store_address_value,
} );

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const setPendingAction = ( pendingAction: undefined | ( () => Promise< any > ) ) => ( {
	type: 'SET_PENDING_ACTION' as const,
	pendingAction,
} );

export const setProgress = ( progress: number ) => ( {
	type: 'SET_PROGRESS' as const,
	progress,
} );

export const setProgressTitle = ( progressTitle: string | undefined ) => ( {
	type: 'SET_PROGRESS_TITLE' as const,
	progressTitle,
} );

export const setStepProgress = (
	stepProgress: { count: number; progress: number } | undefined
) => ( {
	type: 'SET_STEP_PROGRESS' as const,
	stepProgress,
} );

export const setGoals = ( goals: SiteGoal[] ) => ( {
	type: 'SET_GOALS' as const,
	goals,
} );

export const clearImportGoal = () => ( {
	type: 'CLEAR_IMPORT_GOAL' as const,
} );

export const clearDIFMGoal = () => ( {
	type: 'CLEAR_DIFM_GOAL' as const,
} );

export const resetGoals = () => ( {
	type: 'RESET_GOALS' as const,
} );

export const resetIntent = () => ( {
	type: 'RESET_INTENT' as const,
} );

export const resetSelectedDesign = () => ( {
	type: 'RESET_SELECTED_DESIGN' as const,
} );

export const setEditEmail = ( email: string ) => ( {
	type: 'SET_EDIT_EMAIL' as const,
	email,
} );

export const setVerticalId = ( verticalId: string ) => ( {
	type: 'SET_VERTICAL_ID' as const,
	verticalId,
} );

export const setStoreLocationCountryCode = ( storeLocationCountryCode: string ) => ( {
	type: 'SET_STORE_LOCATION_COUNTRY_CODE' as const,
	storeLocationCountryCode,
} );

export const setEcommerceFlowRecurType = ( ecommerceFlowRecurType: string ) => ( {
	type: 'SET_ECOMMERCE_FLOW_RECUR_TYPE' as const,
	ecommerceFlowRecurType,
} );

export const setDomainForm = ( step: Record< string, string > ) => {
	const lastUpdated = Date.now();

	return {
		type: 'SET_DOMAIN_FORM' as const,
		step: { ...step, lastUpdated },
	};
};

export const setDomainCartItem = ( domainCartItem: MinimalRequestCartProduct | undefined ) => ( {
	type: 'SET_DOMAIN_CART_ITEM' as const,
	domainCartItem,
} );

export const setDomainsTransferData = ( bulkDomainsData: DomainTransferData | undefined ) => ( {
	type: 'SET_DOMAINS_TRANSFER_DATA' as const,
	bulkDomainsData,
} );

export const setShouldImportDomainTransferDnsRecords = (
	shouldImportDomainTransferDnsRecords: boolean
) => ( {
	type: 'SET_SHOULD_IMPORT_DOMAIN_TRANSFER_DNS_RECORDS' as const,
	shouldImportDomainTransferDnsRecords,
} );

export const setHideFreePlan = ( hideFreePlan: boolean ) => ( {
	type: 'SET_HIDE_FREE_PLAN' as const,
	hideFreePlan,
} );

export const setHidePlansFeatureComparison = ( hidePlansFeatureComparison: boolean ) => ( {
	type: 'SET_HIDE_PLANS_FEATURE_COMPARISON' as const,
	hidePlansFeatureComparison,
} );

export const setIsMigrateFromWp = ( isMigrateFromWp: boolean ) => ( {
	type: 'SET_IS_MIGRATE_FROM_WP' as const,
	isMigrateFromWp,
} );

export const setPluginsToVerify = ( pluginSlugs: string[] ) => ( {
	type: 'SET_PLUGIN_SLUGS_TO_VERIFY' as const,
	pluginSlugs,
} );

export const setProfilerData = ( profilerData: ProfilerData ) => ( {
	type: 'SET_PROFILER_DATA' as const,
	profilerData,
} );

export const setPaidSubscribers = ( paidSubscribers: boolean ) => ( {
	type: 'SET_PAID_SUBSCRIBERS' as const,
	paidSubscribers,
} );

export type OnboardAction = ReturnType<
	| typeof addFeature
	| typeof removeFeature
	| typeof resetFonts
	| typeof resetOnboardStore
	| typeof resetOnboardStoreWithSkipFlags
	| typeof setStoreType
	| typeof setDomainsTransferData
	| typeof setShouldImportDomainTransferDnsRecords
	| typeof setDomain
	| typeof setDomainCategory
	| typeof setDomainSearch
	| typeof setFonts
	| typeof setHasUsedDomainsStep
	| typeof setHasUsedPlansStep
	| typeof setIsRedirecting
	| typeof setLastLocation
	| typeof setPlanProductId
	| typeof setPluginsToVerify
	| typeof setProfilerData
	| typeof setRandomizedDesigns
	| typeof setSelectedDesign
	| typeof setSelectedStyleVariation
	| typeof setSelectedSite
	| typeof setShowSignupDialog
	| typeof setSiteTitle
	| typeof setSiteGeoAffinity
	| typeof setAnchorPodcastId
	| typeof setAnchorEpisodeId
	| typeof setAnchorSpotifyUrl
	| typeof startOnboarding
	| typeof setIntent
	| typeof setStartingPoint
	| typeof setStoreAddressValue
	| typeof setPendingAction
	| typeof setProgress
	| typeof setProgressTitle
	| typeof setStepProgress
	| typeof setGoals
	| typeof clearImportGoal
	| typeof clearDIFMGoal
	| typeof resetGoals
	| typeof resetIntent
	| typeof resetSelectedDesign
	| typeof setEditEmail
	| typeof setDomainForm
	| typeof setDomainCartItem
	| typeof setSiteDescription
	| typeof setSiteLogo
	| typeof setSiteAccentColor
	| typeof setVerticalId
	| typeof setStoreLocationCountryCode
	| typeof setEcommerceFlowRecurType
	| typeof setHideFreePlan
	| typeof setHidePlansFeatureComparison
	| typeof setProductCartItems
	| typeof setPlanCartItem
	| typeof setIsMigrateFromWp
	| typeof setPaidSubscribers
>;
