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
// somewhat hacky, but resolves the circular dependency issue
import type { Design, StyleVariation } from '@automattic/design-picker/src/types';
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
	const { domain, selectedDesign, siteTitle, selectedFeatures }: State = yield select(
		STORE_KEY,
		'getState'
	);

	const siteUrl = domain?.domain_name || siteTitle || username;
	const lang_id = ( getLanguage( languageSlug ) as Language )?.value;
	const isVideomakerTrial = config.isEnabled( 'videomaker-trial' );
	const defaultTheme = selectedDesign?.theme || 'premium/videomaker';
	const legacyVertical = 'premium/videomaker' === defaultTheme ? 'videomaker' : 'videomaker-white';
	const siteVertical = isVideomakerTrial ? 'videomaker' : legacyVertical;
	const blogTitle = siteTitle.trim() === '' ? __( 'Site Title' ) : siteTitle;
	const themeSlug = isVideomakerTrial ? 'pub/videomaker' : 'pub/twentytwentytwo'; // NOTE: keep this a consistent, free theme so post ids during headstart re-run after premium theme switch remain consistent

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
			theme: themeSlug,
			timezone_string: guessTimezone(),
			use_patterns: true,
			site_vertical_name: siteVertical,
			selected_features: selectedFeatures,
			wpcom_public_coming_soon: 1,
			...( selectedDesign && { is_blank_canvas: isBlankCanvasDesign( selectedDesign ) } ),
			is_videopress_initial_purchase: ! isVideomakerTrial,
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
	const { selectedDesign, selectedFeatures }: State = yield select( STORE_KEY, 'getState' );

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
	const { domain, selectedDesign, siteTitle, selectedFeatures }: State = yield select(
		STORE_KEY,
		'getState'
	);

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
			use_patterns: true,
			site_intent: 'sensei',
			selected_features: selectedFeatures,
			wpcom_public_coming_soon: 1,
			...( selectedDesign && { is_blank_canvas: isBlankCanvasDesign( selectedDesign ) } ),
		},
	} );

	return success;
}

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

export const setPlanCartItem = ( planCartItem: MinimalRequestCartProduct | null ) => ( {
	type: 'SET_PLAN_CART_ITEM' as const,
	planCartItem,
} );

export const setProductCartItems = ( productCartItems: MinimalRequestCartProduct[] | null ) => ( {
	type: 'SET_PRODUCT_CART_ITEMS' as const,
	productCartItems,
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

export const setSiteTitle = ( siteTitle: string ) => ( {
	type: 'SET_SITE_TITLE' as const,
	siteTitle,
} );

export const setSiteDescription = ( siteDescription: string ) => ( {
	type: 'SET_SITE_DESCRIPTION' as const,
	siteDescription,
} );

export const setSiteLogo = ( siteLogo: string | null ) => ( {
	type: 'SET_SITE_LOGO' as const,
	siteLogo,
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

export const setGoals = ( goals: SiteGoal[] ) => ( {
	type: 'SET_GOALS' as const,
	goals,
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

export const setCouponCode = ( couponCode: string ) => ( {
	type: 'SET_COUPON_CODE' as const,
	couponCode,
} );

export const resetCouponCode = () => ( {
	type: 'RESET_COUPON_CODE' as const,
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
	| typeof resetOnboardStore
	| typeof resetOnboardStoreWithSkipFlags
	| typeof setStoreType
	| typeof setDomainsTransferData
	| typeof setDomain
	| typeof setPluginsToVerify
	| typeof setProfilerData
	| typeof setSelectedDesign
	| typeof setSelectedStyleVariation
	| typeof setSelectedSite
	| typeof setSiteTitle
	| typeof setIntent
	| typeof setStartingPoint
	| typeof setPendingAction
	| typeof setProgress
	| typeof setProgressTitle
	| typeof setGoals
	| typeof resetGoals
	| typeof resetIntent
	| typeof resetSelectedDesign
	| typeof setDomainForm
	| typeof setDomainCartItem
	| typeof setSiteDescription
	| typeof setSiteLogo
	| typeof setVerticalId
	| typeof setStoreLocationCountryCode
	| typeof setEcommerceFlowRecurType
	| typeof setCouponCode
	| typeof setHideFreePlan
	| typeof setHidePlansFeatureComparison
	| typeof setProductCartItems
	| typeof setPlanCartItem
	| typeof setIsMigrateFromWp
	| typeof setPaidSubscribers
>;
