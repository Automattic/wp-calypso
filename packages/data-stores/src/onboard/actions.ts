import { guessTimezone, getLanguage } from '@automattic/i18n-utils';
import { dispatch, select } from '@wordpress/data-controls';
import { __ } from '@wordpress/i18n';
import { DomainSuggestion } from '../domain-suggestions/types';
import { STORE_KEY as SITE_STORE } from '../site';
import { CreateSiteParams, Visibility, NewSiteBlogDetails } from '../site/types';
import { FeatureId } from '../wpcom-features/types';
import { STORE_KEY } from './constants';
import type { State } from '.';
// somewhat hacky, but resolves the circular dependency issue
import type { Design, FontPair } from '@automattic/design-picker/src/types';

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

export interface CreateSiteActionParameters {
	username: string;
	languageSlug: string;
	bearerToken?: string;
	visibility: number;
	anchorFmPodcastId: string | null;
	anchorFmEpisodeId: string | null;
	anchorFmSpotifyUrl: string | null;
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
	const {
		domain,
		selectedDesign,
		selectedFonts,
		siteTitle,
		selectedFeatures,
	}: State = yield select( STORE_KEY, 'getState' );

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

export const setRandomizedDesigns = ( randomizedDesigns: { featured: Design[] } ) => ( {
	type: 'SET_RANDOMIZED_DESIGNS' as const,
	randomizedDesigns,
} );

export const setSelectedDesign = ( selectedDesign: Design | undefined ) => ( {
	type: 'SET_SELECTED_DESIGN' as const,
	selectedDesign,
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

export const setPendingAction = ( pendingAction: Promise< any > ) => ( {
	type: 'SET_PENDING_ACTION' as const,
	pendingAction,
} );

export type OnboardAction = ReturnType<
	| typeof addFeature
	| typeof removeFeature
	| typeof resetFonts
	| typeof resetOnboardStore
	| typeof setStoreType
	| typeof setDomain
	| typeof setDomainCategory
	| typeof setDomainSearch
	| typeof setFonts
	| typeof setHasUsedDomainsStep
	| typeof setHasUsedPlansStep
	| typeof setIsRedirecting
	| typeof setLastLocation
	| typeof setPlanProductId
	| typeof setRandomizedDesigns
	| typeof setSelectedDesign
	| typeof setSelectedSite
	| typeof setShowSignupDialog
	| typeof setSiteTitle
	| typeof startOnboarding
	| typeof setIntent
	| typeof setStartingPoint
	| typeof setStoreAddressValue
	| typeof setPendingAction
>;
